import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface KnowledgeRecord {
  id: string;
  title: string;
  tags?: string[];
  content?: string;
}

interface KnowledgeBase {
  [category: string]: KnowledgeRecord[];
}

interface ProviderConfig {
  provider: string;
  configured: boolean;
  model: string | null;
  baseUrl?: string;
}

interface AgentContext {
  profile?: {
    goal?: string;
    conditions?: string;
    allergies?: string;
    restrictions?: string;
    favorites?: string;
    dislikes?: string;
    lifestyle?: string;
    occupation?: string;
    weightKg?: number;
    heightCm?: number;
    age?: number;
    gender?: string;
    bmi?: number;
    bmiCategory?: string;
    caloriesTarget?: number;
    activityLevel?: string;
    dietType?: string;
    equipment?: string;
    injuries?: string;
  };
  todayCalories?: number;
  todayWorkouts?: { exercise?: string; durationMin?: number }[];
  diet?: string;
  cuisine?: string;
  budget?: string;
  place?: string;
  equipment?: string;
  injuries?: string;
  targetMuscles?: string;
  [key: string]: unknown;
}

export interface AgentDataUpdates {
  profile_updates?: {
    name?: string;
    weight_kg?: number;
    height_cm?: number;
    age?: number;
    gender?: string;
    goal?: string;
    activity_level?: string;
    diet_type?: string;
    calories_target?: number;
    allergies?: string;
    conditions?: string;
    restrictions?: string;
    favorites?: string;
    dislikes?: string;
    lifestyle?: string;
    occupation?: string;
    equipment?: string;
    injuries?: string;
  } | null;
  nutrition_log?: {
    meal_type?: string;
    food_item?: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  } | null;
  workout_log?: {
    exercise?: string;
    duration_min?: number;
    calories_burned?: number;
    notes?: string;
  } | null;
  meal_plan?: {
    title?: string;
    meals?: Array<{
      mealType?: string;
      meal_type?: string;
      foodItem?: string;
      food_item?: string;
      calories?: number;
      proteinG?: number;
      protein_g?: number;
      carbsG?: number;
      carbs_g?: number;
      fatG?: number;
      fat_g?: number;
    }>;
  } | null;
  workout_plan?: {
    title?: string;
    workouts?: Array<{
      day?: string;
      exercise?: string;
      durationMin?: number;
      duration_min?: number;
      caloriesBurned?: number;
      calories_burned?: number;
    }>;
  } | null;
}

let knowledgeBase: KnowledgeBase = loadKnowledgeBase();

function loadKnowledgeBase(): KnowledgeBase {
  const kbPath = path.join(__dirname, "..", "data", "knowledge-base.json");
  if (!fs.existsSync(kbPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(kbPath, "utf8"));
  } catch (error: any) {
    console.warn(`Failed to load knowledge base: ${error.message}`);
    return {};
  }
}

export function getProviderConfig(): ProviderConfig {
  const requested = (process.env.AI_PROVIDER || "").toLowerCase().trim();

  // 1. Groq Support
  if ((requested === "groq" || process.env.GROQ_API_KEY) && process.env.GROQ_API_KEY) {
    return {
      provider: "Groq",
      configured: true,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    };
  }

  // 2. GLM (Zhipu AI)
  if (
    (requested === "glm" || requested === "zai" || requested === "zhipu") &&
    process.env.GLM_API_KEY
  ) {
    return {
      provider: "GLM",
      configured: true,
      model: process.env.GLM_MODEL || "glm-4.7-flash",
      baseUrl:
        process.env.GLM_BASE_URL ||
        "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    };
  }

  // 3. Gemini
  if ((requested === "gemini" || !requested) && process.env.GEMINI_API_KEY) {
    return {
      provider: "Gemini",
      configured: true,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    };
  }

  // 4. Claude
  if ((requested === "claude" || !requested) && process.env.ANTHROPIC_API_KEY) {
    return {
      provider: "Claude",
      configured: true,
      model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-latest",
    };
  }

  return {
    provider: requested || "Unknown",
    configured: false,
    model: null,
  };
}

interface FlatRecord extends KnowledgeRecord {
  category: string;
  score?: number;
}

function flattenKnowledgeBase(): FlatRecord[] {
  return Object.entries(knowledgeBase).flatMap(([category, records]) => {
    if (!Array.isArray(records)) return [];
    return records.map((record) => ({
      category,
      id: record.id,
      title: record.title,
      tags: record.tags || [],
      content: record.content || "",
    }));
  });
}

function tokenize(value: string): string[] {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function buildRetrievalText(question: string, context: AgentContext): string {
  const profile = context?.profile || {};
  return [
    question,
    profile.goal,
    profile.conditions,
    profile.allergies,
    profile.restrictions,
    profile.favorites,
    profile.dislikes,
    profile.lifestyle,
    profile.occupation,
    context?.diet,
    context?.cuisine,
    context?.budget,
    context?.place,
    context?.equipment,
    context?.injuries,
    context?.targetMuscles,
  ]
    .filter(Boolean)
    .join(" ");
}

export function retrieveKnowledge(
  question: string,
  context: AgentContext,
): FlatRecord[] {
  const queryTokens = new Set(tokenize(buildRetrievalText(question, context)));
  const records = flattenKnowledgeBase();
  return records
    .map((record) => {
      const haystack = tokenize(
        `${record.category} ${record.title} ${(record.tags || []).join(" ")} ${record.content}`,
      );
      const score = haystack.reduce(
        (total, token) => total + (queryTokens.has(token) ? 1 : 0),
        0,
      );
      return { ...record, score };
    })
    .filter((record) => record.score! > 0 || record.category === "answer_style")
    .sort((a, b) => b.score! - a.score!)
    .slice(0, 8);
}

function formatKnowledgeSnippets(snippets: FlatRecord[]): string {
  if (!snippets.length)
    return "No app knowledge snippets matched. Use general NutriTrack coaching rules.";
  return snippets
    .map((item) => `- [${item.category}/${item.id}] ${item.title}: ${item.content}`)
    .join("\n");
}

function isSimpleGreeting(question: string): boolean {
  return /^(hi|hii|hello|hey|yo|namaste|good morning|good afternoon|good evening)[\s!.]*$/i.test(
    String(question || "").trim(),
  );
}

function wantsDetailedAnswer(question: string): boolean {
  const text = String(question || "").toLowerCase();
  return [
    "plan",
    "meal",
    "diet",
    "workout",
    "exercise",
    "track",
    "progress",
    "suggest",
    "recommend",
    "routine",
    "schedule",
    "grocery",
    "calorie target",
    "macro",
    "food swap",
    "craving",
    "challenge",
    "weekly",
    "report",
  ].some((keyword) => text.includes(keyword));
}

function buildSystemPrompt(): string {
  return [
    "You are NutriTrack, a personalized AI health and fitness companion.",
    "Use the provided user profile, health calculations, preferences, tracker values, diet settings, workout settings, and NutriTrack app knowledge snippets.",
    "Treat NutriTrack app knowledge snippets as trusted product knowledge. Prefer them over generic suggestions when relevant.",
    "Give specific, practical advice with meals, workouts, swaps, habit actions, or explanations when relevant.",
    "Do not diagnose, prescribe medication, or claim to treat disease. For medical conditions, pregnancy, injuries, or medications, give cautious lifestyle guidance and recommend consulting a qualified clinician.",
    "Keep answers concise, structured, and directly useful. Prefer Indian food examples when the context suggests Indian cuisine.",
    "If the user asks for dangerous dieting, extreme weight loss, or pain-through-injury advice, refuse that part and offer a safer alternative.",
    "When creating plans, include exact next actions and avoid vague wellness language.",
    "",
    "IMPORTANT — DATA EXTRACTION & AUTOMATIC LOGGING:",
    "If the user explicitly shares health updates, logs a meal/workout, OR asks you to recommend/create a meal plan or workout plan, append the following block at the VERY END of your response:",
    "<<<DATA>>>",
    '{"profile_updates":null,"nutrition_log":null,"workout_log":null,"meal_plan":null,"workout_plan":null}',
    "<<<END>>>",
    "",
    "Field definitions for <<<DATA>>>:",
    "- profile_updates: name, weight_kg, height_cm, age, gender, goal, activity_level, diet_type, calories_target, allergies, conditions, restrictions, favorites, dislikes, lifestyle, occupation, equipment, injuries",
    "- nutrition_log: single meal entry (meal_type, food_item, calories, protein_g, carbs_g, fat_g)",
    "- workout_log: single workout entry (exercise, duration_min, calories_burned, notes)",
    "- meal_plan: populated when user asks for meal recommendations or a plan. Structure:",
    '  "meal_plan": { "title": "Daily Meal Plan", "meals": [{ "mealType": "Breakfast", "foodItem": "Oatmeal with berries", "calories": 350, "proteinG": 12, "carbsG": 55, "fatG": 6 }] }',
    "- workout_plan: populated when user asks for workout recommendations or routine. Structure:",
    '  "workout_plan": { "title": "Fitness Routine", "workouts": [{ "day": "Today", "exercise": "30 min Brisk Walking", "durationMin": 30, "caloriesBurned": 150 }] }',
    "",
    "Replace null ONLY for fields present in user input or generated in plans. If the user mentioned NOTHING personal and asked NO plan generation, DO NOT output the <<<DATA>>> block at all.",
  ].join("\n");
}

function buildUserPrompt(
  question: string,
  context: AgentContext,
  knowledgeSnippets: FlatRecord[] = [],
  responseMode = "detailed",
): string {
  return [
    `User question: ${question}`,
    `Response mode: ${responseMode}`,
    "",
    "NutriTrack context JSON:",
    JSON.stringify(context, null, 2),
    "",
    "Relevant NutriTrack app knowledge snippets:",
    formatKnowledgeSnippets(knowledgeSnippets),
    "",
    responseMode === "concise"
      ? "Answer as the in-app NutriTrack assistant in 1-2 short sentences. Do not create a full plan unless the user explicitly asks for one."
      : "Answer as the in-app NutriTrack assistant. Include numbers from the context when useful.",
  ].join("\n");
}

function parseDataBlock(raw: string): { answer: string; updates: AgentDataUpdates | null } {
  const match = raw.match(/<<<DATA>>>\s*([\s\S]*?)\s*<<<END>>>/);
  if (!match) return { answer: raw.trim(), updates: null };

  const answer = raw.replace(/<<<DATA>>>[\s\S]*?<<<END>>>/, "").trim();
  try {
    // Strip markdown formatting if the model wrapped JSON in ```json ... ```
    let jsonStr = match[1].trim();
    jsonStr = jsonStr
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    const updates = JSON.parse(jsonStr) as AgentDataUpdates;

    const hasUpdates =
      Boolean(updates.profile_updates && Object.keys(updates.profile_updates).length > 0) ||
      Boolean(updates.nutrition_log && Object.keys(updates.nutrition_log).length > 0) ||
      Boolean(updates.workout_log && Object.keys(updates.workout_log).length > 0) ||
      Boolean(updates.meal_plan?.meals && updates.meal_plan.meals.length > 0) ||
      Boolean(updates.workout_plan?.workouts && updates.workout_plan.workouts.length > 0);

    if (!hasUpdates) {
      return { answer, updates: null };
    }

    return { answer, updates };
  } catch (err) {
    console.error("❌ Failed to parse AI <<<DATA>>> block:", err);
    return { answer, updates: null };
  }
}

async function callOpenAICompatible(
  question: string,
  context: AgentContext,
  config: ProviderConfig,
  apiKey: string,
  knowledgeSnippets: FlatRecord[],
  responseMode: string,
): Promise<string> {
  const response = await fetch(config.baseUrl!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.55,
      max_tokens: responseMode === "concise" ? 200 : 1200,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        {
          role: "user",
          content: buildUserPrompt(question, context, knowledgeSnippets, responseMode),
        },
      ],
    }),
  });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error?.message || data.msg || data.message || "API request failed");
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini(
  question: string,
  context: AgentContext,
  config: ProviderConfig,
  knowledgeSnippets: FlatRecord[],
  responseMode: string,
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  const model = encodeURIComponent(config.model!);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key!,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildUserPrompt(question, context, knowledgeSnippets, responseMode),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.55,
        maxOutputTokens: responseMode === "concise" ? 200 : 1200,
      },
    }),
  });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Gemini request failed");
  return (
    data.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text || "")
      .join("")
      .trim() || ""
  );
}

async function callClaude(
  question: string,
  context: AgentContext,
  config: ProviderConfig,
  knowledgeSnippets: FlatRecord[],
  responseMode: string,
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: responseMode === "concise" ? 200 : 1200,
      temperature: 0.55,
      system: buildSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildUserPrompt(question, context, knowledgeSnippets, responseMode),
        },
      ],
    }),
  });
  const data: any = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Claude request failed");
  return (
    data.content?.map((block: any) => block.text || "").join("").trim() || ""
  );
}

export async function handleAgent(
  question: string,
  context: AgentContext,
): Promise<{
  answer: string;
  provider: string;
  model: string | null;
  responseMode: string;
  knowledgeUsed: string[];
  updates: AgentDataUpdates | null;
}> {
  const config = getProviderConfig();
  if (!config.configured) {
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY, GLM_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY to your environment secrets.",
    );
  }

  if (isSimpleGreeting(question)) {
    return {
      answer:
        "Hey! I am NutriTrack. Ask me about meals, workouts, cravings, calories, or your daily plan. You can also tell me your weight, height, or goal and I'll update your profile!",
      provider: config.provider,
      model: config.model,
      responseMode: "concise",
      knowledgeUsed: [],
      updates: null,
    };
  }

  const responseMode = wantsDetailedAnswer(question) ? "detailed" : "concise";
  const knowledgeSnippets =
    responseMode === "detailed" ? retrieveKnowledge(question, context) : [];

  let raw = "";
  if (config.provider === "Groq") {
    raw = await callOpenAICompatible(
      question,
      context,
      config,
      process.env.GROQ_API_KEY!,
      knowledgeSnippets,
      responseMode,
    );
  } else if (config.provider === "GLM") {
    raw = await callOpenAICompatible(
      question,
      context,
      config,
      process.env.GLM_API_KEY!,
      knowledgeSnippets,
      responseMode,
    );
  } else if (config.provider === "Gemini") {
    raw = await callGemini(question, context, config, knowledgeSnippets, responseMode);
  } else {
    raw = await callClaude(question, context, config, knowledgeSnippets, responseMode);
  }

  const { answer, updates } = parseDataBlock(raw);

  return {
    answer: answer || "I could not generate a useful answer. Please try rephrasing.",
    provider: config.provider,
    model: config.model,
    responseMode,
    knowledgeUsed: knowledgeSnippets.map((item) => `${item.category}/${item.id}`),
    updates,
  };
}