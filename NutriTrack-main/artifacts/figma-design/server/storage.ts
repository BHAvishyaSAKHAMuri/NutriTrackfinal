import {
  type User,
  type InsertUser,
  users,
  userProfiles,
  nutritionLogs,
  workoutLogs,
  type UserProfile,
  type InsertUserProfile,
  type NutritionLog,
  type InsertNutritionLog,
  type WorkoutLog,
  type InsertWorkoutLog,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and, sql } from "drizzle-orm";

const { Pool } = pg;

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmailOrUsername(value: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Password reset
  createResetToken(username: string): Promise<string | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;

  // Profiles
  getOrCreateDefaultProfile(): Promise<UserProfile>;
  getOrCreateProfile(userId: string): Promise<UserProfile>;
  updateProfile(id: string, updates: Partial<InsertUserProfile>): Promise<UserProfile>;

  // Nutrition
  addNutritionLog(entry: InsertNutritionLog): Promise<NutritionLog>;
  getTodayNutrition(profileId: string): Promise<NutritionLog[]>;

  // Workouts
  addWorkoutLog(entry: InsertWorkoutLog): Promise<WorkoutLog>;
  getTodayWorkouts(profileId: string): Promise<WorkoutLog[]>;
}

// ─── BMI helpers ─────────────────────────────────────────────────────────────

export function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal Weight";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obese";
  return "Severely Obese";
}

export function calcCaloriesTarget(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: string,
  activityLevel: string,
  goal: string,
): number {
  // Mifflin-St Jeor BMR
  const bmr =
    gender?.toLowerCase() === "female"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  const factors: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  const tdee = bmr * (factors[activityLevel] ?? 1.55);

  const g = goal?.toLowerCase() ?? "";
  if (g.includes("lose") || g.includes("weight loss")) return Math.round(tdee - 500);
  if (g.includes("gain") || g.includes("bulk")) return Math.round(tdee + 500);
  return Math.round(tdee);
}

// ─── Database storage ─────────────────────────────────────────────────────────

export class DatabaseStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getUserByEmailOrUsername(value: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(sql`${users.username} = ${value} OR ${users.email} = ${value}`)
      .limit(1);
    return result[0];
  }

  // ── Password reset ─────────────────────────────────────────────────────────

  async createResetToken(usernameOrEmail: string): Promise<string | null> {
    const val = usernameOrEmail.trim();
    const found = await this.db
      .select()
      .from(users)
      .where(
        sql`${users.username} = ${val} OR ${users.email} = ${val}`
      )
      .limit(1);
    if (!found[0]) return null;

    const { nanoid } = await import("nanoid");
    const token = nanoid(32);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.db
      .update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(users.id, found[0].id));

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const found = await this.db
      .select()
      .from(users)
      .where(eq(users.resetToken, token))
      .limit(1);

    if (!found[0]) return false;
    if (!found[0].resetTokenExpiry || found[0].resetTokenExpiry < new Date()) return false;

    await this.db
      .update(users)
      .set({ password: newPassword, resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, found[0].id));

    return true;
  }

  // ── Profiles ───────────────────────────────────────────────────────────────

  async getOrCreateDefaultProfile(): Promise<UserProfile> {
    const existing = await this.db.select().from(userProfiles).where(sql`${userProfiles.userId} IS NULL`).limit(1);
    if (existing[0]) return existing[0];
    const result = await this.db
      .insert(userProfiles)
      .values({ name: "User", goal: "Maintain weight", caloriesTarget: 2000 })
      .returning();
    return result[0];
  }

  async getOrCreateProfile(userId: string): Promise<UserProfile> {
    const existing = await this.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    if (existing[0]) return existing[0];
    const result = await this.db
      .insert(userProfiles)
      .values({ userId, name: "User", goal: "Maintain weight", caloriesTarget: 2000 })
      .returning();
    return result[0];
  }

  async updateProfile(
    id: string,
    updates: Partial<InsertUserProfile>,
  ): Promise<UserProfile> {
    // Auto-recalculate BMI and calorie target if we have enough data
    const current = await this.db.select().from(userProfiles).where(eq(userProfiles.id, id)).limit(1);
    const merged = { ...current[0], ...updates };

    if (merged.weightKg && merged.heightCm) {
      const bmi = calcBMI(merged.weightKg, merged.heightCm);
      updates.bmi = bmi;
      updates.bmiCategory = bmiCategory(bmi);
    }

    if (merged.weightKg && merged.heightCm && merged.age && merged.gender) {
      updates.caloriesTarget = calcCaloriesTarget(
        merged.weightKg,
        merged.heightCm,
        merged.age,
        merged.gender,
        merged.activityLevel ?? "moderately_active",
        merged.goal ?? "Maintain weight",
      );
    }

    const result = await this.db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    return result[0];
  }

  // ── Nutrition ──────────────────────────────────────────────────────────────

  async addNutritionLog(entry: InsertNutritionLog): Promise<NutritionLog> {
    const result = await this.db.insert(nutritionLogs).values(entry).returning();
    return result[0];
  }

  async getTodayNutrition(profileId: string): Promise<NutritionLog[]> {
    const today = new Date().toISOString().split("T")[0];
    return this.db
      .select()
      .from(nutritionLogs)
      .where(and(eq(nutritionLogs.profileId, profileId), eq(nutritionLogs.date, today)));
  }

  // ── Workouts ───────────────────────────────────────────────────────────────

  async addWorkoutLog(entry: InsertWorkoutLog): Promise<WorkoutLog> {
    const result = await this.db.insert(workoutLogs).values(entry).returning();
    return result[0];
  }

  async getTodayWorkouts(profileId: string): Promise<WorkoutLog[]> {
    const today = new Date().toISOString().split("T")[0];
    return this.db
      .select()
      .from(workoutLogs)
      .where(and(eq(workoutLogs.profileId, profileId), eq(workoutLogs.date, today)));
  }
}

export const storage = new DatabaseStorage();
