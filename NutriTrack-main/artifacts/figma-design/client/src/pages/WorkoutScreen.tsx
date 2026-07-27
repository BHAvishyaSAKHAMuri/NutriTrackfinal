import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AiChatWidget } from "../components/AiChatWidget";

interface WorkoutLog {
  id: number;
  exercise: string;
  durationMin: number;
  caloriesBurned: number;
  notes?: string;
}

const DEFAULT_WORKOUTS = [
  {
    name: "Brisk Walking",
    difficulty: "Easy",
    difficultyColor: "bg-[#22c55e]",
    img: "/figmaAssets/workout-walking.png",
    duration: "30 min",
    calories: "150 kcal",
    description: "A low-impact cardio perfect for beginners and daily routines.",
  },
  {
    name: "HIIT Workout",
    difficulty: "Medium",
    difficultyColor: "bg-[#ff8d28]",
    img: "/figmaAssets/workout-hiit.png",
    duration: "25 min",
    calories: "350 kcal",
    description: "High-intensity intervals for maximum calorie burn in less time.",
  },
  {
    name: "Strength Training",
    difficulty: "Hard",
    difficultyColor: "bg-red-500",
    img: "/figmaAssets/workout-strength.png",
    duration: "45 min",
    calories: "280 kcal",
    description: "Build muscle and boost your metabolism with resistance training.",
  },
  {
    name: "Yoga Flow",
    difficulty: "Easy",
    difficultyColor: "bg-[#fc0]",
    img: "/figmaAssets/workout-yoga.png",
    duration: "40 min",
    calories: "120 kcal",
    description: "Improve flexibility, reduce stress, and center your mind.",
  },
];

// Helper to choose workout banner based on exercise name
function getWorkoutImage(exerciseName: string): string {
  const lower = (exerciseName || "").toLowerCase();
  if (lower.includes("walk") || lower.includes("run") || lower.includes("jog")) {
    return "/figmaAssets/workout-walking.png";
  }
  if (lower.includes("hiit") || lower.includes("cardio")) {
    return "/figmaAssets/workout-hiit.png";
  }
  if (lower.includes("strength") || lower.includes("gym") || lower.includes("weight")) {
    return "/figmaAssets/workout-strength.png";
  }
  if (lower.includes("yoga") || lower.includes("stretch")) {
    return "/figmaAssets/workout-yoga.png";
  }
  return "/figmaAssets/workout-walking.png";
}

export default function WorkoutScreen() {
  const queryClient = useQueryClient();

  // Fetch live daily profile & workout logs (automatically updates every 24h via backend filter)
  const { data: todayData, refetch } = useQuery({
    queryKey: ["/api/profile/today"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}api/profile/today`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const profile = todayData?.profile;
  const workoutLogs: WorkoutLog[] = todayData?.workoutLogs || [];

  // If user/AI has logged workouts today, show those; otherwise fall back to fresh default suggestions
  const isCustomPlan = workoutLogs.length > 0;
  
  const workoutsToDisplay = isCustomPlan
    ? workoutLogs.map((log) => {
        const duration = log.durationMin || 30;
        const isHard = duration >= 45;
        const isMedium = duration >= 25 && duration < 45;

        return {
          name: log.exercise || "Workout Session",
          difficulty: isHard ? "Hard" : isMedium ? "Medium" : "Easy",
          difficultyColor: isHard ? "bg-red-500" : isMedium ? "bg-[#ff8d28]" : "bg-[#22c55e]",
          img: getWorkoutImage(log.exercise),
          duration: `${duration} min`,
          calories: `${log.caloriesBurned || 0} kcal`,
          description: log.notes || `Logged workout routine for today.`,
        };
      })
    : DEFAULT_WORKOUTS;

  return (
    <div className="min-h-screen overflow-x-auto bg-[#f8fafc]">
      <div className="relative w-[1440px] min-h-screen pb-24">
        {/* Header */}
        <header className="absolute h-[80px] left-0 top-0 w-[1440px] bg-white shadow-sm flex items-center z-10">
          <Link href="/">
            <span className="absolute left-[75px] font-['Poppins',sans-serif] text-[28px] font-bold cursor-pointer">
              <span className="text-[#22c55e]">Nutri</span>
              <span className="text-[#ff6b81]">Track</span>
            </span>
          </Link>
          <nav className="absolute left-[454px] flex items-center gap-[40px]">
            <Link href="/dashboard">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">
                Dashboard
              </span>
            </Link>
            <Link href="/meal-plan">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">
                Meal Plan
              </span>
            </Link>
            <Link href="/bmi">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">
                BMI
              </span>
            </Link>
            <Link href="/workouts">
              <span className="font-bold text-[20px] text-[#22c55e] cursor-pointer font-['Readex_Pro',sans-serif]">
                Workouts
              </span>
            </Link>
          </nav>
          <Link href="/signup">
            <button className="absolute right-[20px] top-[18px] bg-[#22c55e] text-white font-bold text-[16px] px-5 py-2 rounded-[12px] hover:bg-green-600 transition-colors cursor-pointer font-['Inter',sans-serif]">
              Get started →
            </button>
          </Link>
        </header>

        {/* Navigation Tabs */}
        <div className="absolute top-[98px] left-[77px] flex items-center gap-3">
          <Link href="/meal-plan">
            <div className="bg-white border border-[#e5e7eb] h-[48px] w-[170px] rounded-[24px] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="font-['Poppins',sans-serif] text-[16px] font-medium text-[#374151]">
                Meal Plan
              </span>
            </div>
          </Link>
          <div className="bg-[#22c55e] h-[48px] w-[170px] rounded-[24px] flex items-center justify-center">
            <span className="font-['Poppins',sans-serif] text-[16px] font-medium text-white">
              Workouts
            </span>
          </div>
        </div>

        {/* Section Title */}
        <div className="absolute top-[185px] left-[194px] flex items-center gap-4">
          <p className="font-['Inter',sans-serif] font-bold text-[36px] text-black">
            {isCustomPlan ? "Today's Workouts" : "Workout Suggestions"}
          </p>
          {isCustomPlan && (
            <span className="bg-green-100 text-[#22c55e] text-xs font-semibold px-3 py-1 rounded-full">
              Active Today
            </span>
          )}
        </div>

        {/* Workout Grid */}
        <div className="absolute top-[260px] left-[130px] grid grid-cols-2 gap-[80px] w-[1200px]">
          {workoutsToDisplay.map((w, i) => (
            <div key={i} className="flex flex-col gap-4 hover:opacity-95 transition-opacity">
              <div className="w-[402px] h-[170px] rounded-[18px] overflow-hidden bg-gray-200 shadow-md">
                <img
                  src={w.img}
                  alt={w.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div>
                <p className="font-['Poppins',sans-serif] font-medium text-[30px] text-black">
                  {w.name}
                </p>
                <p className="font-['Poppins',sans-serif] text-[15px] text-gray-500 mt-1">
                  {w.description}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span
                    className={`${w.difficultyColor} text-white font-['Poppins',sans-serif] font-medium text-[16px] px-4 py-1 rounded-[18px]`}
                  >
                    {w.difficulty}
                  </span>
                  <span className="text-gray-500 text-[15px]">⏱ {w.duration}</span>
                  <span className="text-[#22c55e] text-[15px] font-semibold">🔥 {w.calories}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded AI Chat Widget (Triggers instant refetch when user asks AI to reset or add workouts) */}
      <AiChatWidget
        profile={profile}
        onDataUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/profile/today"] });
          refetch();
        }}
      />
    </div>
  );
}