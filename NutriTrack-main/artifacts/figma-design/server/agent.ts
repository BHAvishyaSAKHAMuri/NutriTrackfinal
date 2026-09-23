import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🚨 PASTE YOUR FULL 56-CHARACTER KEY BETWEEN THESE QUOTES 🚨
const GROQ_KEY = "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".trim();

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
  profile_updates?: any | null;
  nutrition_log?: {
    meal_type?: string;
    food_item?: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
  } | null;
  workout_log?: any | null;
  meal_plan?: any | null;
  workout_plan?: any | null;
}

let knowledgeBase: KnowledgeBase = loadKnowledgeBase();

function loadKnowledgeBase(): KnowledgeBase {
  const kbPath = path.join(__dirname, "..", "data", "knowledge-base.json");
  if (!fs.existsSync(kbPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(kbPath, "utf8"));
  } catch (error: any) {
    return {};
  }
}

export function getProviderConfig(): ProviderConfig {
  const requested = (process.env.AI_PROVIDER || "").toLowerCase().trim();

  if ((requested === "groq" || GROQ_KEY) && GROQ_KEY) {
    return {
      provider: "Groq",
      configured: true,
      model: "qwen/qwen3.8-27b", // Verified active model on your key
      baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    };
  }

  if ((requested === "glm" || requested === "zai" || requested === "zhipu") && process.env.GLM_API_KEY) {
    return {
      provider: "GLM",
      configured: true,
      model: process.env.GLM_MODEL || "glm-4.7-flash",
      baseUrl: process.env.GLM_BASE_URL || "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    };
  }

  if ((requested === "gemini" || !requested) && process.env.GEMINI_API_KEY) {
    return { provider: "Gemini", configured: true, model: process.env.GEMINI_MODEL || "gemini-2.0-flash" };
  }

  if ((requested === "claude" || !requested) && process.env.ANTHROPIC_API_KEY) {
    return { provider: "Claude", configured: true, model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-latest" };
  }

  return { provider: requested || "Unknown", configured: false, model: null };
}

interface FlatRecord extends KnowledgeRecord { category: string; score?: number; }

function flattenKnowledgeBase(): FlatRecord[] {
  return Object.entries(knowledgeBase).flatMap(([category, records]) => {
    if (!Array.isArray(records)) return [];
    return records.map((record) => ({ category, id: record.id, title: record.title, tags: record.tags || [], content: record.content || "" }));
  });
}

function tokenize(value: string): string[] {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

function buildRetrievalText(question: string, context: AgentContext): string {
  const profile = context?.profile || {};
  return [question, profile.goal, context?.diet].filter(Boolean).join(" ");
}

export function retrieveKnowledge(question: string, context: AgentContext): FlatRecord[] {
  const queryTokens = new Set(tokenize(buildRetrievalText(question, context)));
  return flattenKnowledgeBase()
    .map((record) => {
      const haystack = tokenize(`${record.category} ${record.title} ${(record.tags || []).join(" ")} ${record.content}`);
      const score = haystack.reduce((total, token) => total + (queryTokens.has(token) ? 1 : 0), 0);
      return { ...record, score };
    })
    .filter((record) => record.score! > 0 || record.category === "answer_style")
    .sort((a, b) => b.score! - a.score!)
    .slice(0, 8);
}

function isSimpleGreeting(question: string): boolean {
  return /^(hi|hii|hello|hey|yo|namaste|good morning)[\s!.]*$/i.test(String(question || "").trim());
}

function wantsDetailedAnswer(question: string): boolean {
  return ["plan", "meal", "diet", "workout"].some((keyword) => String(question || "").toLowerCase().includes(keyword));
}

function buildSystemPrompt(): string {
  return [
    "You are NutriTrack, a personalized AI health and fitness companion.",
    "IMPORTANT: ALWAYS start your response with a friendly, helpful, conversational text answer directly addressing the user's question. DO NOT just output JSON.",
    "Give specific, practical advice with meals, workouts, swaps, habit actions, or explanations when relevant.",
    "",
    "CRITICAL INSTRUCTION — DATA EXTRACTION & AUTOMATIC LOGGING:",
    "ONLY extract structured data for 'nutrition_log' if the user explicitly states they ALREADY ATE, DRANK, or ARE CURRENTLY EATING something.",
    "DO NOT log food if the user is just asking for advice, meal plans, or suggestions (e.g., 'What should I eat?'). Keep 'nutrition_log' as null in those cases.",
    "",
    "INDIAN FOOD CALORIE ESTIMATES (Multiply by quantity!):",
    "- Idli (1 piece): 50 kcal",
    "- Dosa (Plain): 130 kcal",
    "- Masala Dosa: 280 kcal",
    "- Roti/Chapati (1 piece): 80 kcal",
    "- Rice (1 bowl): 190 kcal",
    "- Dal (1 bowl): 130 kcal",
    "- Poha/Upma (1 bowl): 200 kcal",
    "",
    "MEAL TYPE: Assign to 'Breakfast', 'Lunch', 'Evening Snack', or 'Dinner'. Items like Idli and Dosa belong to 'Breakfast' unless told otherwise.",
    "",
    "Append the following block at the VERY END of your response, AFTER your text answer:",
    "<<<DATA>>>",
    '{"nutrition_log":null,"workout_log":null,"meal_plan":null,"workout_plan":null}',
    "<<<END>>>"
  ].join("\n");
}

function buildUserPrompt(question: string, context: AgentContext, knowledgeSnippets: FlatRecord[] = [], responseMode = "detailed"): string {
  return [
    `User request: "${question}"`,
    "User Profile Context:",
    JSON.stringify(context, null, 2),
    "Provide your response directly to the user now:"
  ].join("\n");
}

function parseDataBlock(raw: string): { answer: string; updates: AgentDataUpdates | null } {
  const match = raw.match(/<<<DATA>>>\s*([\s\S]*?)\s*<<<END>>>/);
  if (!match) return { answer: raw.trim(), updates: null };

  const answer = raw.replace(/<<<DATA>>>[\s\S]*?<<<END>>>/, "").trim();
  try {
    let jsonStr = match[1].trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
    const updates = JSON.parse(jsonStr) as AgentDataUpdates;
    return { answer, updates };
  } catch (err) {
    return { answer, updates: null };
  }
}

async function callOpenAICompatible(question: string, context: AgentContext, config: ProviderConfig, apiKey: string, knowledgeSnippets: FlatRecord[], responseMode: string): Promise<string> {
  const response = await fetch(config.baseUrl!, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.6,
      max_tokens: responseMode === "concise" ? 300 : 1200,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(question, context, knowledgeSnippets, responseMode) },
      ],
    }),
  });
  
  const data: any = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    console.error("🚨 GROQ API ERROR 🚨:", JSON.stringify(data, null, 2));
    throw new Error(`Groq Error: ${data.error?.message || response.statusText}`);
  }
  
  return data.choices?.[0]?.message?.content?.trim() || "";
}

export async function handleAgent(question: string, context: AgentContext): Promise<any> {
  const config = getProviderConfig();

  if (!config.configured) throw new Error("No AI provider configured.");
  if (isSimpleGreeting(question)) {
    return { answer: "Hey! I am NutriTrack. Tell me what you ate today!", provider: config.provider, model: config.model, responseMode: "concise", knowledgeUsed: [], updates: null };
  }

  const responseMode = wantsDetailedAnswer(question) ? "detailed" : "concise";
  let raw = "";

  // Make the call
  if (config.provider === "Groq") {
    raw = await callOpenAICompatible(question, context, config, GROQ_KEY, [], responseMode);
  }

  // Stricter fallback for AI missing the JSON block entirely
  const lowerQ = question.toLowerCase();
  const isLoggingPastMeal = /\b(ate|had|drank|consumed)\b/.test(lowerQ) && !lowerQ.includes("what should");

  if (raw && !raw.includes("<<<DATA>>>") && isLoggingPastMeal) {
    const foodMention = question.replace(/i ate|i had|i drank|i consumed/gi, '').trim();
    let meal = "Snack";
    if (lowerQ.match(/idly|idli|dosa|breakfast/)) meal = "Breakfast";
    else if (lowerQ.match(/rice|lunch/)) meal = "Lunch";
    else if (lowerQ.match(/dinner/)) meal = "Dinner";
    
    raw += `\n<<<DATA>>>\n{"nutrition_log": {"meal_type": "${meal}", "food_item": "${foodMention || "Food"}", "calories": 0}}\n<<<END>>>`;
  }

  let { answer, updates } = parseDataBlock(raw);

  // 🛡️ THE BULLETPROOF FAIL-SAFE: 
  if (updates?.nutrition_log) {
    if (!updates.nutrition_log.calories || updates.nutrition_log.calories === 0) {
      const food = (updates.nutrition_log.food_item || question).toLowerCase();
      let estCal = 250; 

      if (food.match(/idli|idly/)) estCal = 100; 
      else if (food.match(/masala dosa/)) estCal = 280;
      else if (food.match(/dosa/)) estCal = 130;
      else if (food.match(/roti|chapati/)) estCal = 160; 
      else if (food.match(/rice/)) estCal = 190;
      else if (food.match(/dal/)) estCal = 130;
      else if (food.match(/upma|poha/)) estCal = 200;
      else if (food.match(/tea|coffee/)) estCal = 80;

      updates.nutrition_log.calories = estCal;
    }
  }

  // Clean up final answer text
  let finalAnswer = answer;
  if (!finalAnswer && updates?.nutrition_log) {
    finalAnswer = `I've logged your ${updates.nutrition_log.food_item} (${updates.nutrition_log.calories} kcal) for ${updates.nutrition_log.meal_type}.`;
  } else if (!finalAnswer) {
      finalAnswer = "I've processed your request, but the model didn't return a text response. Can you provide more details?";
  }

  return {
    answer: finalAnswer,
    provider: config.provider,
    model: config.model,
    responseMode,
    knowledgeUsed: [],
    updates,
  };
}