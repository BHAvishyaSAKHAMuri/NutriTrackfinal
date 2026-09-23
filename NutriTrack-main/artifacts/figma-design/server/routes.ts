import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { handleAgent, getProviderConfig } from "./agent";
import { passport, requireAuth } from "./auth";
import Groq from "groq-sdk";
import sharp from "sharp";
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Helper to safely parse JSON from LLM outputs ---
function parseJsonResponse(text: string): Record<string, any> {
  try {
    // Strips markdown code blocks (```json ... ```) if present
    const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON response:", text);
    return {};
  }
}

// --- Lazy Groq Client Helper ---
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY environment variable is missing or empty. Please add GROQ_API_KEY to your .env file."
    );
  }
  return new Groq({ apiKey });
}

// --- Image Resizing Helper (Prevents pixel-limit errors) ---
async function resizeBase64Image(base64Data: string, maxDimension = 2048): Promise<string> {
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Image, "base64");

  const resizedBuffer = await sharp(buffer)
    .resize(maxDimension, maxDimension, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  return `data:image/jpeg;base64,${resizedBuffer.toString("base64")}`;
}

// --- MET calculation helper ---
const MET_MAP: Record<string, number> = {
  walking: 3.8,
  running: 8.0,
  cycling: 6.8,
  swimming: 7.0,
  yoga: 3.0,
  gym: 5.0,
  weightlifting: 5.0,
  hiit: 8.0,
  cardio: 7.0,
  pilates: 3.0,
};

function calculateCaloriesBurned(
  exercise: string,
  durationMin: number,
  weightKg: number = 70
): number {
  const normalized = (exercise || "").toLowerCase().trim();
  const matchedKey = Object.keys(MET_MAP).find((k) => normalized.includes(k));
  const met = matchedKey ? MET_MAP[matchedKey] : 5.0;
  return Math.round(met * weightKg * (durationMin / 60));
}

export interface AgentContext {
  profile?: Record<string, any>;
  totalsTillNow?: {
    totalCaloriesConsumed: number;
    totalCaloriesBurned: number;
    totalWorkoutMin: number;
    netCalories: number;
  };
  todayWorkouts?: any[];
  todayNutrition?: any[];
  [key: string]: any;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ── Health check ──────────────────────────────────────────────────────────

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ── Profile Endpoints ─────────────────────────────────────────────────────

  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      if (!profile) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/profile", requireAuth, async (req, res) => {
    try {
      const currentProfile = await storage.getOrCreateProfile((req.user as any).id);
      const updatedProfile = await storage.updateProfile(currentProfile.id, req.body);
      res.json(updatedProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── 🌟 NEW ROUTE ADDED HERE: Missing Endpoint for the Frontend Dashboard ──
  app.get("/api/profile/today", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      if (!profile) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }
      
      const todayNutrition = await storage.getTodayNutrition(profile.id);
      const todayWorkouts = await storage.getTodayWorkouts(profile.id);

      res.json({
        profile,
        nutritionLogs: todayNutrition,
        workoutLogs: todayWorkouts
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Vision / Food Recognition (Groq Vision with Indian Cuisine Taxonomy) ──

  app.post("/api/vision/food", requireAuth, async (req, res) => {
    try {
      const { imageBase64, foodHint } = req.body;

      if (!imageBase64) {
        res.status(400).json({ error: "Image data is required." });
        return;
      }

      const imageDataUrl = await resizeBase64Image(imageBase64);
      const groq = getGroqClient();

      const userHint = foodHint
        ? `User context hint: "${foodHint}". Prioritize matching this hint if visually reasonable.`
        : "";

      const systemPrompt = `You are a master Indian culinary expert and nutritionist. Analyze this food image carefully.
${userHint}

INDIAN DISH VISUAL TAXONOMY & DIFFERENTIATION RULES:

1. SOUTH INDIAN MIXED RICE & DAL-RICE:
   - SAMBAR RICE / SAMBAR SADAM / BISIBELEBATH: Soft, wet, mashed porridge consistency made of rice cooked WITH toor dal in an orange-red spiced gravy. May contain visible tomatoes, drumsticks, onions, or curry leaves. It is thick and soupy/mashed, NEVER dry separate grains.
   - TOMATO RICE (THAKKALI SADAM): Dry or fluffy SEPARATE rice grains sautéed in tomato gravy. It has NO dal cooked into a soft mushy porridge.
   - CURD RICE (THAYIR SADAM): Creamy white rice mixed with curd/yogurt, tempered with mustard seeds, green chillies, and curry leaves.
   - LEMON RICE / PULIHORA: Bright yellow (turmeric) or dark brown (tamarind) separate-grain rice with peanuts and curry leaves.

2. NORTH INDIAN & STUFFED FLATBREADS:
   - ALOO PARATHA / STUFFED PARATHA: Thick, round, whole-wheat flatbread cooked on a griddle/tava with distinct brown roasted spots, containing yellow spiced potato filling inside.
   - ROTI / NAAN / PURI: Plain wheat flatbreads or baked leavened bread WITHOUT potato stuffing inside.
   - KHICHDI: Wet, soupy porridge of yellow rice and moong dal with turmeric.
   - BIRYANI / PULAO: Long-grain Basmati rice with distinct separate grains and spices.

3. SOUTH INDIAN BREAKFAST / TIFFINS:
   - MASALA DOSA: Thin, golden-brown, paper-crisp rice-and-lentil CREPE/BATTER folded or rolled.
   - RAVA UPMA: Coarse, crumbly semolina grains with mustard seeds, curry leaves, onions, coriander, and lemon.
   - VEN PONGAL: Creamy, soft, thick ghee-glossy rice/dal porridge with visible whole black peppercorns, cumin, and cashew halves.
   - IDLI: Distinct round, thick, white steamed rice cakes.

4. SWEETS & DESSERTS (MITHAI):
   - SUJI HALWA / SHEERA: Sweet semolina paste in ghee (NO mustard seeds, NO chillies, NO onions).
   - GAJAR KA HALWA: Bright orange/red grated carrot dessert cooked in milk and ghee.

CRITICAL CONSISTENCY DIRECTIVES:
- If rice is cooked WITH DAL into a soft, wet, thick porridge/soup texture with orange gravy, it is **Sambar Rice / Sambar Sadam**, NOT Tomato Rice.

Return ONLY a valid JSON object matching this exact structure:
{
  "foodItem": "Exact Authentic Indian Dish Name",
  "mealType": "Breakfast | Lunch | Dinner | Snack",
  "calories": 320,
  "proteinG": 9,
  "carbsG": 55,
  "fatG": 8,
  "alternatives": ["Alternative Dish 1", "Alternative Dish 2"],
  "notes": "Short portion estimate under 15 words"
}`;

      const completion = await groq.chat.completions.create({
        model: "qwen/qwen3.6-27b",
        reasoning_effort: "none",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: systemPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        temperature: 0.0, // Strict deterministic output
        max_tokens: 1024,
      } as any);

      const responseText = completion.choices[0]?.message?.content || "{}";
      const analysis = parseJsonResponse(responseText);

      // Save to database storage
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      const today = new Date().toISOString().split("T")[0];

      const newLog = await storage.addNutritionLog({
        profileId: profile.id,
        date: today,
        mealType: analysis.mealType || "Breakfast",
        foodItem: analysis.foodItem || foodHint || "Scanned Meal",
        calories: Number(analysis.calories) || 0,
        proteinG: Number(analysis.proteinG) || 0,
        carbsG: Number(analysis.carbsG) || 0,
        fatG: Number(analysis.fatG) || 0,
      });

      res.json({
        success: true,
        analysis,
        loggedEntry: newLog,
      });
    } catch (error: any) {
      console.error("Groq Vision Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image." });
    }
  });

  // ── Nutrition log ─────────────────────────────────────────────────────────

  app.post("/api/nutrition", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      if (!profile) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }
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

  app.get("/api/workouts", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      if (!profile) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }
      const todayWorkouts = await storage.getTodayWorkouts(profile.id);
      res.json(todayWorkouts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workouts", requireAuth, async (req, res) => {
    try {
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      if (!profile) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }
      const { exercise, durationMin, notes } = req.body;
      const weightKg = profile?.weightKg || 70;
      const today = new Date().toISOString().split("T")[0];

      const caloriesBurned = req.body.caloriesBurned
        ? Number(req.body.caloriesBurned)
        : calculateCaloriesBurned(exercise, Number(durationMin), weightKg);

      const workout = await storage.addWorkoutLog({
        profileId: profile.id,
        date: today,
        exercise,
        durationMin: Number(durationMin),
        caloriesBurned,
        notes: notes || "",
      });

      res.json(workout);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to log workout" });
    }
  });

  // ── Auth ──────────────────────────────────────────────────────────────────

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Not authenticated." });
      return;
    }
    const u = req.user as any;
    res.json({ id: u.id, username: u.username, email: u.email ?? null });
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        res
          .status(401)
          .json({ error: info?.message || "Invalid email or password." });
        return;
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        res.json({
          ok: true,
          id: user.id,
          username: user.username,
          email: user.email ?? null,
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ ok: true });
    });
  });

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
      await new Promise<void>((resolve, reject) => {
        req.logIn(user, (err) => (err ? reject(err) : resolve()));
      });
      res.json({
        ok: true,
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error: any) {
      const isDuplicate =
        error.message?.includes("unique") || error.code === "23505";
      res.status(isDuplicate ? 409 : 500).json({
        error: isDuplicate ? "Username or email already taken." : error.message,
      });
    }
  });

  // ── Password reset ────────────────────────────────────────────────────────

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { username } = req.body as { username?: string };
    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Username is required." });
      return;
    }
    try {
      const token = await storage.createResetToken(username.trim());
      if (!token) {
        res.json({ ok: true });
        return;
      }
      res.json({ ok: true, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { token, newPassword } = req.body as {
      token?: string;
      newPassword?: string;
    };
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
        res.status(400).json({
          error: "Invalid or expired reset code. Please request a new one.",
        });
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

      // Fetch user profile
      const profile = await storage.getOrCreateProfile((req.user as any).id);
      if (!profile) {
        res.status(404).json({ error: "Profile not found." });
        return;
      }

      const lowerQ = question.toLowerCase();

      // Check for explicit reset intent
      if (
        lowerQ.includes("reset workout") ||
        lowerQ.includes("clear workout") ||
        lowerQ.includes("reset my exercises") ||
        lowerQ.includes("delete workout plan")
      ) {
        await storage.clearTodayWorkouts(profile.id);

        res.json({
          answer: "I've reset your workout plan for today!",
          dataUpdated: true,
        });
        return;
      }

      // Check for explicit reset intent for food
      if (
        lowerQ.includes("clear food") ||
        lowerQ.includes("reset meals") ||
        lowerQ.includes("delete food") ||
        lowerQ.includes("clear nutrition")
      ) {
        if (typeof (storage as any).clearTodayNutrition === 'function') {
           await (storage as any).clearTodayNutrition(profile.id);
           res.json({
             answer: "I've wiped your meals for today! Dashboard is clean.",
             dataUpdated: true,
           });
           return;
        } else {
           res.json({
             answer: "The 'clearTodayNutrition' function is missing in storage.ts! Please add it first.",
             dataUpdated: false,
           });
           return;
        }
      }

      const config = getProviderConfig();
      if (!config.configured) {
        res.status(503).json({
          error: "No AI provider configured. Add GEMINI_API_KEY to environment secrets.",
        });
        return;
      }

      // Fetch logged nutrition & workouts
      const [todayNutrition, todayWorkouts] = await Promise.all([
        storage.getTodayNutrition(profile.id),
        storage.getTodayWorkouts(profile.id),
      ]);

      // Compute exact totals
      const totalCaloriesConsumed = todayNutrition.reduce(
        (sum, n) => sum + (n.calories ?? 0),
        0
      );
      const totalCaloriesBurned = todayWorkouts.reduce(
        (sum, w) => sum + (w.caloriesBurned ?? 0),
        0
      );
      const totalWorkoutMin = todayWorkouts.reduce(
        (sum, w) => sum + (w.durationMin ?? 0),
        0
      );

      // Context building
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
        totalsTillNow: {
          totalCaloriesConsumed,
          totalCaloriesBurned,
          totalWorkoutMin,
          netCalories: totalCaloriesConsumed - totalCaloriesBurned,
        },
        todayWorkouts,
        todayNutrition,
      };

      // Pass request to handleAgent
      const result = await handleAgent(question, agentContext as any);

      let dataUpdated = false;
      let updatedProfile = null;
      const today = new Date().toISOString().split("T")[0];

      // Process DB updates if returned by AI
      if (result.updates) {
        const {
          profile_updates,
          nutrition_log,
          workout_log,
          meal_plan,
          workout_plan,
        } = result.updates;

        if (profile_updates && Object.keys(profile_updates).length > 0) {
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
          dataUpdated = true;
        }

        if (nutrition_log && (nutrition_log.food_item || nutrition_log.calories)) {
          await storage.addNutritionLog({
            profileId: profile.id,
            date: today,
            mealType: nutrition_log.meal_type ?? null,
            foodItem: nutrition_log.food_item ?? null,
            calories: nutrition_log.calories ? Number(nutrition_log.calories) : null,
            proteinG: nutrition_log.protein_g ? Number(nutrition_log.protein_g) : null,
            carbsG: nutrition_log.carbs_g ? Number(nutrition_log.carbs_g) : null,
            fatG: nutrition_log.fat_g ? Number(nutrition_log.fat_g) : null,
          });
          dataUpdated = true;
        }

        if (workout_log && (workout_log.exercise || workout_log.duration_min)) {
          const durationMin = Number(workout_log.duration_min) || 0;
          const exercise = workout_log.exercise || "Workout";
          const caloriesBurned =
            workout_log.calories_burned && Number(workout_log.calories_burned) > 0
              ? Number(workout_log.calories_burned)
              : calculateCaloriesBurned(exercise, durationMin, profile.weightKg || 70);

          await storage.addWorkoutLog({
            profileId: profile.id,
            date: today,
            exercise,
            durationMin,
            caloriesBurned,
            notes: workout_log.notes ?? null,
          });
          dataUpdated = true;
        }

        if (meal_plan && Array.isArray(meal_plan.meals)) {
          for (const meal of meal_plan.meals) {
            await storage.addNutritionLog({
              profileId: profile.id,
              date: today,
              mealType: meal.mealType || meal.meal_type || "Meal",
              foodItem: meal.foodItem || meal.food_item || "AI Recommended Meal",
              calories: meal.calories ? Number(meal.calories) : null,
              proteinG: meal.proteinG ? Number(meal.proteinG) : null,
              carbsG: meal.carbsG ? Number(meal.carbsG) : null,
              fatG: meal.fatG ? Number(meal.fatG) : null,
            });
          }
          dataUpdated = true;
        }

        if (workout_plan && Array.isArray(workout_plan.workouts)) {
          await storage.clearTodayWorkouts(profile.id);

          for (const item of workout_plan.workouts) {
            const durationMin = Number(item.durationMin || item.duration_min) || 30;
            const exercise = item.exercise || "AI Workout Routine";
            const caloriesBurned =
              item.caloriesBurned || item.calories_burned
                ? Number(item.caloriesBurned || item.calories_burned)
                : calculateCaloriesBurned(exercise, durationMin, profile.weightKg || 70);

            await storage.addWorkoutLog({
              profileId: profile.id,
              date: today,
              exercise,
              durationMin,
              caloriesBurned,
              notes: item.day ? `Scheduled for ${item.day}` : null,
            });
          }
          dataUpdated = true;
        }
      }

      res.json({
        answer: result.answer,
        provider: result.provider,
        model: result.model,
        responseMode: result.responseMode,
        knowledgeUsed: result.knowledgeUsed,
        updates: result.updates,
        dataUpdated,
        updatedProfile,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "AI agent failed" });
    }
  });

  return httpServer;
}