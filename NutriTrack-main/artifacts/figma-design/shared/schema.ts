import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  real,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── Health Profile ──────────────────────────────────────────────────────────

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").default("User"),
  weightKg: real("weight_kg"),
  heightCm: real("height_cm"),
  age: integer("age"),
  gender: varchar("gender", { length: 20 }),
  goal: text("goal").default("Maintain weight"),
  caloriesTarget: integer("calories_target").default(2000),
  bmi: real("bmi"),
  bmiCategory: text("bmi_category"),
  activityLevel: text("activity_level").default("moderately_active"),
  dietType: text("diet_type"),
  allergies: text("allergies"),
  conditions: text("conditions"),
  restrictions: text("restrictions"),
  favorites: text("favorites"),
  dislikes: text("dislikes"),
  lifestyle: text("lifestyle"),
  occupation: text("occupation"),
  equipment: text("equipment"),
  injuries: text("injuries"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// ─── Nutrition Logs ──────────────────────────────────────────────────────────

export const nutritionLogs = pgTable("nutrition_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  mealType: varchar("meal_type", { length: 50 }), // breakfast, lunch, dinner, snack
  foodItem: text("food_item"),
  calories: integer("calories"),
  proteinG: real("protein_g"),
  carbsG: real("carbs_g"),
  fatG: real("fat_g"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type InsertNutritionLog = typeof nutritionLogs.$inferInsert;

// ─── Workout Logs ─────────────────────────────────────────────────────────────

export const workoutLogs = pgTable("workout_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  exercise: text("exercise"),
  durationMin: integer("duration_min"),
  caloriesBurned: integer("calories_burned"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type InsertWorkoutLog = typeof workoutLogs.$inferInsert;
