import { Link } from "wouter";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AiChatWidget } from "@/components/AiChatWidget";
import { ProfileEditModal } from "@/components/ProfileEditModal";
import { QuickLogWidget } from "@/components/QuickLogWidget";

interface UserProfile {
  id: string;
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

interface TodaySummary {
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number;
  totalWorkoutMin: number;
  nutrition: { foodItem?: string; mealType?: string; calories?: number }[];
  workouts: { exercise?: string; durationMin?: number; caloriesBurned?: number }[];
}

function getBMISegment(bmi: number | null | undefined) {
  if (!bmi) return null;
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obese";
  return "Severely Obese";
}

function bmiColor(category: string | null | undefined) {
  switch (category) {
    case "Normal Weight": return "text-[#22c55e]";
    case "Underweight": return "text-blue-500";
    case "Overweight": return "text-yellow-500";
    case "Obese": return "text-orange-500";
    case "Severely Obese": return "text-red-600";
    default: return "text-gray-400";
  }
}

function bmiTagColor(category: string | null | undefined) {
  switch (category) {
    case "Normal Weight": return "bg-[#dcfce7] text-[#22c55e]";
    case "Underweight": return "bg-blue-100 text-blue-600";
    case "Overweight": return "bg-yellow-100 text-yellow-600";
    case "Obese": return "bg-orange-100 text-orange-600";
    case "Severely Obese": return "bg-red-100 text-red-600";
    default: return "bg-gray-100 text-gray-400";
  }
}

export default function DashboardScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [today, setToday] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, todayRes] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}api/profile`, { credentials: "include" }),
        fetch(`${import.meta.env.BASE_URL}api/profile/today`, { credentials: "include" }),
      ]);
      if (profileRes.ok) setProfile(await profileRes.json());
      if (todayRes.ok) setToday(await todayRes.json());
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const bmi = profile?.bmi ?? null;
  const bmiCat = profile?.bmiCategory ?? null;
  const calories = profile?.caloriesTarget ?? null;
  const goal = profile?.goal ?? null;
  const hasProfile = !!(profile?.weightKg && profile?.heightCm);

  // BMI scale active segment
  const activeSegment = getBMISegment(bmi);

  const bmiSegments = [
    { label: "Underweight", range: "<18.5", color: "bg-blue-200" },
    { label: "Normal", range: "18.5–24.9", color: "bg-[#22c55e]" },
    { label: "Overweight", range: "25–29.9", color: "bg-yellow-300" },
    { label: "Obese", range: "30–34.9", color: "bg-orange-400" },
    { label: "Severely Obese", range: ">35", color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen overflow-x-auto bg-[#f8fafc]">
      <div className="relative w-[1440px] min-h-screen">
        {/* Header Nav */}
        <header className="absolute h-[80px] left-0 top-0 w-[1440px] bg-white shadow-sm flex items-center z-10">
          <Link href="/">
            <span className="absolute left-[75px] font-['Poppins',sans-serif] text-[28px] font-bold cursor-pointer">
              <span className="text-[#22c55e]">Nutri</span>
              <span className="text-[#ff6b81]">Track</span>
            </span>
          </Link>
          <nav className="absolute left-[454px] flex items-center gap-[40px]">
            <Link href="/dashboard">
              <span className="font-bold text-[20px] text-[#22c55e] cursor-pointer font-['Readex_Pro',sans-serif]">Dashboard</span>
            </Link>
            <Link href="/meal-plan">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">Meal Plan</span>
            </Link>
            <Link href="/bmi">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">BMI</span>
            </Link>
            <Link href="/workouts">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">Progress</span>
            </Link>
          </nav>
          <Link href="/signup">
            <button className="absolute right-[20px] top-[18px] bg-[#22c55e] text-white font-bold text-[16px] px-5 py-2 rounded-[12px] flex items-center gap-2 hover:bg-green-600 transition-colors cursor-pointer font-['Inter',sans-serif]">
              🔔 Notifications
            </button>
          </Link>
        </header>

        {/* Main content */}
        <div className="absolute top-[100px] left-0 w-full px-[60px]">
          {/* Welcome */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-['Poppins',sans-serif] text-[32px] font-bold text-black">
                Welcome back{profile?.name && profile.name !== "User" ? `, ${profile.name}` : ""}! 👋
              </h1>
              <p className="font-['Poppins',sans-serif] text-[18px] text-gray-500 mt-1">
                Here's your health overview for today
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProfileEdit(true)}
                className="bg-white border border-[#22c55e] text-[#22c55e] font-semibold text-[14px] px-4 py-2 rounded-[10px] hover:bg-[#f0fdf4] transition-colors cursor-pointer font-['Inter',sans-serif]"
              >
                ✏️ Edit Profile
              </button>
              <button
                onClick={logout}
                className="bg-white border border-gray-200 text-gray-500 font-semibold text-[14px] px-4 py-2 rounded-[10px] hover:bg-gray-50 transition-colors cursor-pointer font-['Inter',sans-serif]"
              >
                🚪 Log out
              </button>
              <div className="w-[60px] h-[60px] rounded-full bg-[#22c55e] flex items-center justify-center text-white font-bold text-[24px]">
                {profile?.name?.[0]?.toUpperCase() ?? "N"}
              </div>
            </div>
          </div>

          {/* Profile prompt banner */}
          {!loading && !hasProfile && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-[16px] px-6 py-4 flex items-center gap-4">
              <span className="text-[24px]">💬</span>
              <div>
                <p className="font-['Poppins',sans-serif] font-semibold text-amber-800 text-[15px]">
                  Tell the AI coach your details to personalise your dashboard
                </p>
                <p className="font-['Poppins',sans-serif] text-amber-700 text-[13px] mt-0.5">
                  Try: "My weight is 68 kg, height 170 cm, age 28, female, goal is to lose weight"
                </p>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* BMI */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
              <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500 mb-1">Your BMI</p>
              {loading ? (
                <div className="h-[50px] bg-gray-100 rounded-lg animate-pulse mt-1" />
              ) : bmi ? (
                <>
                  <p className={`font-['Poppins',sans-serif] text-[42px] font-bold leading-tight ${bmiColor(bmiCat)}`}>
                    {bmi.toFixed(1)}
                  </p>
                  <span className={`inline-block text-[13px] font-semibold px-3 py-1 rounded-full mt-2 ${bmiTagColor(bmiCat)}`}>
                    {bmiCat}
                  </span>
                </>
              ) : (
                <p className="font-['Poppins',sans-serif] text-[28px] font-bold text-gray-300 leading-tight mt-2">—</p>
              )}
            </div>

            {/* Ideal BMI Range */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
              <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500 mb-1">Ideal BMI Range</p>
              <p className="font-['Poppins',sans-serif] text-[42px] font-bold text-black leading-tight">18.5–24.9</p>
              <p className="text-[13px] text-gray-400 mt-2">Healthy range</p>
            </div>

            {/* Calories */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
              <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500 mb-1">Daily Calorie Target</p>
              {loading ? (
                <div className="h-[50px] bg-gray-100 rounded-lg animate-pulse mt-1" />
              ) : calories ? (
                <>
                  <p className="font-['Poppins',sans-serif] text-[42px] font-bold text-[#22c55e] leading-tight">
                    {calories.toLocaleString()}
                  </p>
                  <p className="text-[13px] text-gray-400 mt-2">kcal / day</p>
                </>
              ) : (
                <p className="font-['Poppins',sans-serif] text-[28px] font-bold text-gray-300 leading-tight mt-2">—</p>
              )}
            </div>

            {/* Goal */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
              <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500 mb-1">Your Goal</p>
              {loading ? (
                <div className="h-[50px] bg-gray-100 rounded-lg animate-pulse mt-1" />
              ) : (
                <>
                  <p className="font-['Poppins',sans-serif] text-[24px] font-bold text-black leading-tight mt-2">
                    {goal ?? "Not set"}
                  </p>
                  <p className="text-[13px] text-gray-400 mt-2">Stay consistent</p>
                </>
              )}
            </div>
          </div>

          {/* Today's Activity */}
          {today && (today.totalCaloriesConsumed > 0 || today.totalWorkoutMin > 0) && (
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
                <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500 mb-1">🍽️ Calories Consumed Today</p>
                <p className="font-['Poppins',sans-serif] text-[36px] font-bold text-[#ff6b81] leading-tight">
                  {today.totalCaloriesConsumed.toLocaleString()}
                </p>
                <p className="text-[13px] text-gray-400 mt-1">kcal eaten</p>
                {calories && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#ff6b81] rounded-full transition-all"
                        style={{ width: `${Math.min(100, (today.totalCaloriesConsumed / calories) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[12px] text-gray-400 mt-1">
                      {Math.round((today.totalCaloriesConsumed / calories) * 100)}% of target
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
                <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500 mb-1">🏋️ Calories Burned Today</p>
                <p className="font-['Poppins',sans-serif] text-[36px] font-bold text-orange-500 leading-tight">
                  {today.totalCaloriesBurned.toLocaleString()}
                </p>
                <p className="text-[13px] text-gray-400 mt-1">kcal burned</p>
              </div>
              <div className="bg-white rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.08)]">
                <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500 mb-1">⏱️ Workout Time Today</p>
                <p className="font-['Poppins',sans-serif] text-[36px] font-bold text-blue-500 leading-tight">
                  {today.totalWorkoutMin}
                </p>
                <p className="text-[13px] text-gray-400 mt-1">minutes</p>
                {today.workouts.length > 0 && (
                  <p className="text-[12px] text-gray-500 mt-2 truncate">
                    {today.workouts.map(w => w.exercise).filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* BMI Scale */}
          <div className="bg-white rounded-[20px] p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.08)] mb-8">
            <h2 className="font-['Poppins',sans-serif] text-[22px] font-bold text-black mb-6">BMI Scale</h2>
            <div className="flex gap-2 mb-3">
              {bmiSegments.map((item) => {
                const active = item.label === activeSegment;
                return (
                  <div key={item.label} className="flex-1">
                    <div
                      className={`h-[94px] rounded-[12px] ${item.color} ${
                        active ? "ring-2 ring-offset-2 ring-gray-600 scale-105" : ""
                      } flex flex-col items-center justify-center transition-transform`}
                    >
                      <p className="text-white font-bold text-[11px] text-center px-1">{item.range}</p>
                    </div>
                    <p
                      className={`text-[11px] text-center mt-2 font-semibold ${
                        active ? "text-gray-800 font-bold" : "text-gray-600"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${bmi ? "bg-[#22c55e]" : "bg-gray-300"}`} />
                {bmi ? (
                  <p className="font-['Poppins',sans-serif] text-[15px] text-gray-700">
                    Your BMI: <strong>{bmi.toFixed(1)}</strong> — {bmiCat}
                    {profile?.weightKg && profile?.heightCm && (
                      <span className="text-gray-400 ml-2">
                        ({profile.weightKg} kg / {profile.heightCm} cm)
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="font-['Poppins',sans-serif] text-[15px] text-gray-400">
                    Enter your weight & height via the AI coach to see your BMI
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Today's meals log */}
          {today && today.nutrition.length > 0 && (
            <div className="bg-white rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.08)] mb-8">
              <h2 className="font-['Poppins',sans-serif] text-[18px] font-bold text-black mb-4">🍽️ Today's Meals</h2>
              <div className="flex flex-col gap-2">
                {today.nutrition.map((n, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <span className="text-[13px] font-semibold text-gray-700 capitalize">
                        {n.mealType ?? "Meal"}
                      </span>
                      {n.foodItem && (
                        <span className="text-[13px] text-gray-500 ml-2">— {n.foodItem}</span>
                      )}
                    </div>
                    {n.calories && (
                      <span className="text-[13px] font-semibold text-[#ff6b81]">
                        {n.calories} kcal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip of the Day + Quick Links */}
          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-[rgba(128,239,128,0.3)] rounded-[15px] p-6">
              <p className="font-['Poppins',sans-serif] text-[16px] font-semibold text-black mb-2">💡 Tip of the day</p>
              <p className="font-['Poppins',sans-serif] text-[15px] text-gray-700">
                Drink more water and stay active. Small steps lead to big changes!
              </p>
              <p className="font-['Poppins',sans-serif] text-[13px] text-gray-500 mt-3">
                💬 Tell the AI coach your weight, meals, and workouts to keep your dashboard up to date.
              </p>
            </div>
            <div className="bg-white rounded-[20px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.08)] flex flex-col gap-3">
              <p className="font-['Poppins',sans-serif] text-[16px] font-bold text-black">Quick Actions</p>
              <Link href="/meal-plan">
                <button className="w-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#22c55e] font-semibold py-2 px-4 rounded-[10px] text-left hover:bg-green-100 transition-colors cursor-pointer">
                  📋 View Today's Meal Plan
                </button>
              </Link>
              <Link href="/workouts">
                <button className="w-full bg-[#fff7ed] border border-orange-200 text-orange-500 font-semibold py-2 px-4 rounded-[10px] text-left hover:bg-orange-50 transition-colors cursor-pointer">
                  🏋️ Workout Suggestions
                </button>
              </Link>
              <Link href="/bmi">
                <button className="w-full bg-[#f0f9ff] border border-blue-200 text-blue-500 font-semibold py-2 px-4 rounded-[10px] text-left hover:bg-blue-50 transition-colors cursor-pointer">
                  📊 Recalculate BMI
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AiChatWidget profile={profile} onDataUpdate={fetchData} />
      <QuickLogWidget onLogged={fetchData} />

      {showProfileEdit && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setShowProfileEdit(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
