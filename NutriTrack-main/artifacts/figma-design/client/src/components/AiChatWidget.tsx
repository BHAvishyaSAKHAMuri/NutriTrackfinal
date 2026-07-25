import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
  dataUpdated?: boolean;
}

interface UserProfile {
  id?: string;
  name?: string;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  gender?: string;
  goal?: string;
  caloriesTarget?: number;
  bmi?: number;
  bmiCategory?: string;
  activityLevel?: string;
  dietType?: string;
  allergies?: string;
  conditions?: string;
  restrictions?: string;
  favorites?: string;
  dislikes?: string;
  lifestyle?: string;
  occupation?: string;
  equipment?: string;
  injuries?: string;
}

interface Props {
  profile?: UserProfile | null;
  onDataUpdate?: () => void;
}

const SUGGESTIONS = [
  "What should I eat for breakfast?",
  "Give me a quick workout plan",
  "My weight is 70 kg, height 170 cm",
  "I had dal rice for lunch, about 450 calories",
  "I ran for 30 minutes today",
  "My goal is to lose weight",
];

async function askAgent(
  question: string,
  profile: UserProfile | null | undefined,
): Promise<{ answer: string; dataUpdated: boolean }> {
  const context = profile
    ? {
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
        },
      }
    : {};

  const res = await fetch(`${import.meta.env.BASE_URL}api/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, context }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Agent failed");
  return { answer: data.answer as string, dataUpdated: !!data.dataUpdated };
}

export function AiChatWidget({ profile, onDataUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hey! I'm your NutriTrack AI coach 🌿\n\nAsk me about meals, workouts, or calories. You can also update your profile by telling me things like:\n• \"My weight is 68 kg, height 165 cm\"\n• \"I had poha for breakfast, 250 calories\"\n• \"I did 45 min yoga today\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }]);
    setLoading(true);
    try {
      const { answer, dataUpdated } = await askAgent(question, profile);
      setMessages((m) => [...m, { role: "assistant", text: answer, dataUpdated }]);
      if (dataUpdated && onDataUpdate) {
        onDataUpdate();
      }
    } catch (err: any) {
      const msg = err.message || "";
      const isQuota = msg.toLowerCase().includes("quota") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: isQuota
            ? "⚠️ The AI coach is temporarily unavailable (Gemini API quota exceeded).\n\nYou can still update your profile and log meals/workouts using:\n• The ✏️ Edit Profile button at the top\n• The 📝 Quick Log button (pink button)"
            : `Sorry, something went wrong: ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-8 right-8 w-[64px] h-[64px] rounded-full bg-[#22c55e] shadow-[0px_8px_30px_rgba(34,197,94,0.45)] flex items-center justify-center hover:bg-green-600 transition-all hover:scale-105 z-50 cursor-pointer"
          aria-label="Open AI Coach"
        >
          <span className="text-[28px]">🤖</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-8 right-8 w-[400px] h-[580px] bg-white rounded-[24px] shadow-[0px_20px_60px_rgba(0,0,0,0.18)] flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-[#22c55e] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] rounded-full bg-white/20 flex items-center justify-center text-[20px]">
                🤖
              </div>
              <div>
                <p className="font-['Poppins',sans-serif] font-bold text-white text-[15px] leading-tight">
                  NutriTrack AI
                </p>
                <p className="font-['Inter',sans-serif] text-white/80 text-[12px]">
                  {profile?.name && profile.name !== "User"
                    ? `Hi ${profile.name} · Your personal coach`
                    : "Your personal health coach"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer text-[16px]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Profile pill — show current stats if available */}
          {(profile?.bmi || profile?.caloriesTarget) && (
            <div className="bg-[#f0fdf4] border-b border-[#bbf7d0] px-4 py-2 flex gap-3 text-[12px] text-[#15803d] font-['Inter',sans-serif] shrink-0">
              {profile.bmi && (
                <span>📊 BMI {profile.bmi.toFixed(1)} ({profile.bmiCategory})</span>
              )}
              {profile.caloriesTarget && (
                <span>🔥 Target {profile.caloriesTarget} kcal</span>
              )}
              {profile.goal && (
                <span className="truncate">🎯 {profile.goal}</span>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-[28px] h-[28px] rounded-full bg-[#dcfce7] flex items-center justify-center text-[14px] shrink-0 mr-2 mt-1">
                    🌿
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[280px]">
                  <div
                    className={`px-4 py-3 rounded-[16px] font-['Inter',sans-serif] text-[13.5px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#22c55e] text-white rounded-tr-[4px]"
                        : "bg-[#f3f4f6] text-[#1f2937] rounded-tl-[4px]"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.dataUpdated && (
                    <div className="flex items-center gap-1 ml-1">
                      <span className="text-[11px] text-[#22c55e] font-semibold">✓ Dashboard updated</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-[28px] h-[28px] rounded-full bg-[#dcfce7] flex items-center justify-center text-[14px] shrink-0 mr-2 mt-1">
                  🌿
                </div>
                <div className="bg-[#f3f4f6] rounded-[16px] rounded-tl-[4px] px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (shown when only welcome message exists) */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11.5px] font-['Inter',sans-serif] bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] px-3 py-1.5 rounded-full hover:bg-[#dcfce7] transition-colors cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              placeholder="Tell me your weight, meals, workouts…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              disabled={loading}
              className="flex-1 h-[42px] rounded-[12px] border border-[#e5e7eb] px-4 font-['Inter',sans-serif] text-[13.5px] text-gray-700 focus:outline-none focus:border-[#22c55e] transition-colors disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-[42px] h-[42px] rounded-[12px] bg-[#22c55e] disabled:bg-gray-200 flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
