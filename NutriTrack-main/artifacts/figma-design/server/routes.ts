import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { handleAgent, getProviderConfig } from "./agent";
import { passport, requireAuth } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ── Health check ──────────────────────────────────────────────────────────

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ── Profile ───────────────────────────────────────────────────────────────

  // GET /api/profile — returns (or auto-creates) the user's profile
  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH /api/profile — update profile fields
  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      const updated = await storage.updateProfile(profile.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/profile/today — today's nutrition + workout summary
  app.get("/api/profile/today", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      const [nutrition, workouts] = await Promise.all([
        storage.getTodayNutrition(profile.id),
        storage.getTodayWorkouts(profile.id),
      ]);

      const totalCaloriesConsumed = nutrition.reduce(
        (sum, n) => sum + (n.calories ?? 0),
        0
      );
      const totalCaloriesBurned = workouts.reduce(
        (sum, w) => sum + (w.caloriesBurned ?? 0),
        0
      );
      const totalWorkoutMin = workouts.reduce(
        (sum, w) => sum + (w.durationMin ?? 0),
        0
      );

      res.json({
        nutrition,
        workouts,
        totalCaloriesConsumed,
        totalCaloriesBurned,
        totalWorkoutMin,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Nutrition log ─────────────────────────────────────────────────────────

  app.post("/api/nutrition", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      const today = new Date().toISOString().split("T")[0];
      const entry = await storage.addNutritionLog({
        profileId: req.body.profileId ?? profile.id,
        date: today,
        mealType: req.body.mealType ?? null,
        foodItem: req.body.foodItem ?? null,
        calories: req.body.calories ?? null,
        proteinG: req.body.proteinG ?? null,
        carbsG: req.body.carbsG ?? null,
        fatG: req.body.fatG ?? null,
      });
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Workout log ────────────────────────────────────────────────────────────

  app.post("/api/workout", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      const today = new Date().toISOString().split("T")[0];
      const entry = await storage.addWorkoutLog({
        profileId: req.body.profileId ?? profile.id,
        date: today,
        exercise: req.body.exercise ?? null,
        durationMin: req.body.durationMin ?? null,
        caloriesBurned: req.body.caloriesBurned ?? null,
        notes: req.body.notes ?? null,
      });
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Auth ──────────────────────────────────────────────────────────────────

  // GET /api/auth/me — return the currently logged-in user (or 401)
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const u = req.user as any;
    res.json({ id: u.id, username: u.username, email: u.email ?? null });
  });

  // POST /api/auth/login — authenticate with email + password
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) {
          res.status(401).json({ error: info?.message || "Invalid email or password." });
          return;
        }
        req.logIn(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          res.json({ ok: true, id: user.id, username: user.username, email: user.email ?? null });
        });
      },
    )(req, res, next);
  });

  // POST /api/auth/logout — end the session
  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ ok: true });
    });
  });

  // POST /api/auth/register — create a new user account and log them in
  app.post("/api/auth/register", async (req, res) => {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };
    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required." });
      return;
    }
    try {
      const user = await storage.createUser({
        username: username.trim(),
        email: email?.trim() || undefined,
        password,
      });
      // Wrap req.logIn in a Promise so errors propagate correctly in async handlers
      await new Promise<void>((resolve, reject) => {
        req.logIn(user, (err) => (err ? reject(err) : resolve()));
      });
      res.json({ ok: true, id: user.id, username: user.username, email: user.email });
    } catch (error: any) {
      const isDuplicate = error.message?.includes("unique") || error.code === "23505";
      res.status(isDuplicate ? 409 : 500).json({
        error: isDuplicate ? "Username or email already taken." : error.message,
      });
    }
  });

  // ── Password reset ────────────────────────────────────────────────────────

  // POST /api/auth/forgot-password — generate a reset token for a username
  app.post("/api/auth/forgot-password", async (req, res) => {
    const { username } = req.body as { username?: string };
    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Username is required." });
      return;
    }
    try {
      const token = await storage.createResetToken(username.trim());
      if (!token) {
        // Don't reveal whether the username exists
        res.json({ ok: true });
        return;
      }
      // In a real app this token would be emailed. We return it directly so the
      // UI can display it as a one-time reset code (dev / no-email setup).
      res.json({ ok: true, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/auth/reset-password — validate token and set new password
  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required." });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }
    try {
      const ok = await storage.resetPassword(token.trim(), newPassword);
      if (!ok) {
        res.status(400).json({ error: "Invalid or expired reset code. Please request a new one." });
        return;
      }
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── AI Agent ──────────────────────────────────────────────────────────────

  app.post("/api/agent", requireAuth, async (req, res) => {
    try {
      const { question, context } = req.body as {
        question?: string;
        context?: Record<string, unknown>;
      };

      if (!question || typeof question !== "string") {
        res.status(400).json({ error: "Question is required." });
        return;
      }

      const config = getProviderConfig();
      if (!config.configured) {
        res.status(503).json({
          error:
            "No AI provider configured. Add GEMINI_API_KEY, ANTHROPIC_API_KEY, or GLM_API_KEY to environment secrets.",
        });
        return;
      }

      // Get the current profile to use as context baseline
      const profile = await storage.getOrCreateProfile((req.user as any).id);

      // Merge server-side profile into context so the agent always has it
      const agentContext = {
        ...(context || {}),
        profile: {
          goal: profile.goal,
          conditions: profile.conditions,
          allergies: profile.allergies,
          restrictions: profile.restrictions,
          favorites: profile.favorites,
          dislikes: profile.dislikes,
          lifestyle: profile.lifestyle,
          occupation: profile.occupation,
          weightKg: profile.weightKg,
          heightCm: profile.heightCm,
          age: profile.age,
          gender: profile.gender,
          bmi: profile.bmi,
          bmiCategory: profile.bmiCategory,
          caloriesTarget: profile.caloriesTarget,
          activityLevel: profile.activityLevel,
          dietType: profile.dietType,
          equipment: profile.equipment,
          injuries: profile.injuries,
          ...((context as any)?.profile || {}),
        },
      };

      const result = await handleAgent(question, agentContext);

      // ── Persist any extracted data ──────────────────────────────────────
      const today = new Date().toISOString().split("T")[0];
      let updatedProfile = profile;

      if (result.updates) {
        const { profile_updates, nutrition_log, workout_log } = result.updates;

        if (profile_updates && Object.keys(profile_updates).length > 0) {
          // Map snake_case API names → camelCase drizzle column names
          const mapped: Record<string, any> = {};
          if (profile_updates.name !== undefined) mapped.name = profile_updates.name;
          if (profile_updates.weight_kg !== undefined) mapped.weightKg = profile_updates.weight_kg;
          if (profile_updates.height_cm !== undefined) mapped.heightCm = profile_updates.height_cm;
          if (profile_updates.age !== undefined) mapped.age = profile_updates.age;
          if (profile_updates.gender !== undefined) mapped.gender = profile_updates.gender;
          if (profile_updates.goal !== undefined) mapped.goal = profile_updates.goal;
          if (profile_updates.activity_level !== undefined) mapped.activityLevel = profile_updates.activity_level;
          if (profile_updates.diet_type !== undefined) mapped.dietType = profile_updates.diet_type;
          if (profile_updates.allergies !== undefined) mapped.allergies = profile_updates.allergies;
          if (profile_updates.conditions !== undefined) mapped.conditions = profile_updates.conditions;
          if (profile_updates.restrictions !== undefined) mapped.restrictions = profile_updates.restrictions;
          if (profile_updates.favorites !== undefined) mapped.favorites = profile_updates.favorites;
          if (profile_updates.dislikes !== undefined) mapped.dislikes = profile_updates.dislikes;
          if (profile_updates.lifestyle !== undefined) mapped.lifestyle = profile_updates.lifestyle;
          if (profile_updates.occupation !== undefined) mapped.occupation = profile_updates.occupation;
          if (profile_updates.equipment !== undefined) mapped.equipment = profile_updates.equipment;
          if (profile_updates.injuries !== undefined) mapped.injuries = profile_updates.injuries;
          if (profile_updates.calories_target !== undefined) mapped.caloriesTarget = profile_updates.calories_target;

          updatedProfile = await storage.updateProfile(profile.id, mapped);
        }

        if (nutrition_log && (nutrition_log.food_item || nutrition_log.calories)) {
          await storage.addNutritionLog({
            profileId: profile.id,
            date: today,
            mealType: nutrition_log.meal_type ?? null,
            foodItem: nutrition_log.food_item ?? null,
            calories: nutrition_log.calories ?? null,
            proteinG: nutrition_log.protein_g ?? null,
            carbsG: nutrition_log.carbs_g ?? null,
            fatG: nutrition_log.fat_g ?? null,
          });
        }

        if (workout_log && (workout_log.exercise || workout_log.duration_min)) {
          await storage.addWorkoutLog({
            profileId: profile.id,
            date: today,
            exercise: workout_log.exercise ?? null,
            durationMin: workout_log.duration_min ?? null,
            caloriesBurned: workout_log.calories_burned ?? null,
            notes: workout_log.notes ?? null,
          });
        }
      }

      res.json({
        answer: result.answer,
        provider: result.provider,
        model: result.model,
        responseMode: result.responseMode,
        knowledgeUsed: result.knowledgeUsed,
        dataUpdated: !!result.updates,
        updatedProfile,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "AI agent failed" });
    }
  });

  return httpServer;
}
