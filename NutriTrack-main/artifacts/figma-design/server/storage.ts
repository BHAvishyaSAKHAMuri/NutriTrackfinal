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
  clearTodayWorkouts(profileId: string): Promise<void>;
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

export function calcBMI(weightKg: number | string, heightCm: number | string): number {
  const w = Number(weightKg);
  const h = Number(heightCm) / 100;
  if (!w || !h || h <= 0) return 0;
  return Math.round((w / (h * h)) * 10) / 10;
}

export function bmiCategory(bmi: number): string {
  if (bmi <= 0) return "Unknown";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal Weight";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obese";
  return "Severely Obese";
}

export function calcCaloriesTarget(
  weightKg: number | string,
  heightCm: number | string,
  age: number | string,
  gender?: string | null,
  activityLevel?: string | null,
  goal?: string | null,
): number {
  const w = Number(weightKg);
  const h = Number(heightCm);
  const a = Number(age) || 25;
  if (!w || !h) return 2000;

  const gnd = gender?.toLowerCase() === "female" ? "female" : "male";

  // Mifflin-St Jeor BMR
  const bmr =
    gnd === "female"
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5;

  const factors: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  };
  const tdee = bmr * (factors[activityLevel || "moderately_active"] ?? 1.55);

  const g = goal?.toLowerCase() ?? "";
  if (g.includes("lose") || g.includes("weight loss")) return Math.round(tdee - 500);
  if (g.includes("gain") || g.includes("bulk")) return Math.round(tdee + 500);
  return Math.round(tdee);
}

// Helper to attach computed BMI & targets to profile objects dynamically
function enrichProfile(profile: UserProfile): UserProfile {
  if (!profile) return profile;

  // Clone profile into a plain object
  const plain = { ...profile } as any;

  const weightKg = Number(plain.weightKg ?? plain.weight_kg);
  const heightCm = Number(plain.heightCm ?? plain.height_cm);
  const age = Number(plain.age) || 20;

  let bmi = plain.bmi;
  let bmiCat = plain.bmiCategory;
  let calTarget = plain.caloriesTarget;

  if (weightKg > 0 && heightCm > 0) {
    bmi = calcBMI(weightKg, heightCm);
    bmiCat = bmiCategory(bmi);
  }

  if (weightKg > 0 && heightCm > 0) {
    calTarget = calTarget || calcCaloriesTarget(
      weightKg,
      heightCm,
      age,
      plain.gender,
      plain.activityLevel,
      plain.goal
    );
  }

  return {
    ...plain,
    bmi,
    bmiCategory: bmiCat,
    caloriesTarget: calTarget,
  };
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
    if (existing[0]) return enrichProfile(existing[0]);
    const result = await this.db
      .insert(userProfiles)
      .values({ name: "User", goal: "Maintain weight", caloriesTarget: 2000 })
      .returning();
    return enrichProfile(result[0]);
  }

  async getOrCreateProfile(userId: string): Promise<UserProfile> {
    const existing = await this.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);
    if (existing[0]) return enrichProfile(existing[0]);
    const result = await this.db
      .insert(userProfiles)
      .values({ userId, name: "User", goal: "Maintain weight", caloriesTarget: 2000 })
      .returning();
    return enrichProfile(result[0]);
  }

  async updateProfile(
    id: string,
    updates: Partial<InsertUserProfile>,
  ): Promise<UserProfile> {
    const current = await this.db.select().from(userProfiles).where(eq(userProfiles.id, id)).limit(1);
    const existing = current[0] || {};
    const merged = { ...existing, ...updates };

    const weightKg = Number((merged as any).weightKg ?? (merged as any).weight_kg);
    const heightCm = Number((merged as any).heightCm ?? (merged as any).height_cm);
    const age = Number(merged.age) || 20;

    if (weightKg > 0 && heightCm > 0) {
      const bmi = calcBMI(weightKg, heightCm);
      updates.bmi = bmi as any;
      updates.bmiCategory = bmiCategory(bmi);
    }

    if (weightKg > 0 && heightCm > 0) {
      updates.caloriesTarget = calcCaloriesTarget(
        weightKg,
        heightCm,
        age,
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
      
    return enrichProfile(result[0]);
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

  async clearTodayWorkouts(profileId: string): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    await this.db
      .delete(workoutLogs)
      .where(and(eq(workoutLogs.profileId, profileId), eq(workoutLogs.date, today)));
  }

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