import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AiChatWidget } from "../components/AiChatWidget"; // Adjust path to match your structure

interface NutritionLog {
  id: number;
  mealType: string;
  foodItem: string;
  calories: number;
}

const DEFAULT_MEALS = [
  {
    time: "Breakfast",
    items: "Oats Upma + Banana + Green Tea",
    kcal: "350 kcal",
    img: "/figmaAssets/meal-breakfast.png",
    color: "text-[rgba(15,60,151,0.47)]",
  },
  {
    time: "Lunch",
    items: "Brown Rice + Dal + Mix Veg + Salad",
    kcal: "500 kcal",
    img: "/figmaAssets/meal-lunch.png",
    color: "text-[rgba(15,60,151,0.47)]",
  },
  {
    time: "Evening Snack",
    items: "Mixed Nuts + Fruit Bowl",
    kcal: "200 kcal",
    img: "/figmaAssets/meal-snack.png",
    color: "text-[rgba(15,60,151,0.47)]",
  },
  {
    time: "Dinner",
    items: "Roti + Paneer Curry + Dal Soup",
    kcal: "450 kcal",
    img: "/figmaAssets/meal-dinner.png",
    color: "text-[rgba(15,60,151,0.47)]",
  },
  {
    time: "Bed time",
    items: "Warm Turmeric Milk",
    kcal: "90 kcal",
    img: "/figmaAssets/meal-bedtime.png",
    color: "text-[rgba(15,60,151,0.47)]",
  },
];

// Helper to assign images based on meal type name
function getMealImage(mealType: string): string {
  const lower = (mealType || "").toLowerCase();
  if (lower.includes("breakfast")) return "/figmaAssets/meal-breakfast.png";
  if (lower.includes("lunch")) return "/figmaAssets/meal-lunch.png";
  if (lower.includes("snack")) return "/figmaAssets/meal-snack.png";
  if (lower.includes("dinner")) return "/figmaAssets/meal-dinner.png";
  if (lower.includes("bed")) return "/figmaAssets/meal-bedtime.png";
  return "/figmaAssets/meal-breakfast.png";
}

export default function MealPlanScreen() {
  const queryClient = useQueryClient();

  // Fetch live daily profile & nutrition data
  const { data: todayData, refetch } = useQuery({
    queryKey: ["/api/profile/today"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}api/profile/today`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const profile = todayData?.profile;
  const nutritionLogs: NutritionLog[] = todayData?.nutritionLogs || [];

  // If AI generated dynamic meals, display them; otherwise fallback to defaults
  const mealsToDisplay =
    nutritionLogs.length > 0
      ? nutritionLogs.map((log) => ({
          time: log.mealType || "Meal",
          items: log.foodItem || "Custom Food Entry",
          kcal: log.calories ? `${log.calories} kcal` : "0 kcal",
          img: getMealImage(log.mealType),
          color: "text-[rgba(15,60,151,0.47)]",
        }))
      : DEFAULT_MEALS;

  const targetKcal = profile?.caloriesTarget || 1800;

  return (
    <div className="min-h-screen overflow-x-auto bg-[#f8fafc]">
      <div className="relative w-[1440px] min-h-screen pb-16">
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
              <span className="font-bold text-[20px] text-[#22c55e] cursor-pointer font-['Readex_Pro',sans-serif]">
                Meal Plan
              </span>
            </Link>
            <Link href="/bmi">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">
                BMI
              </span>
            </Link>
            <Link href="/workouts">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">
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

        {/* Tabs */}
        <div className="absolute top-[98px] left-[77px] flex items-center gap-3">
          <div className="bg-[#22c55e] h-[48px] w-[170px] rounded-[24px] flex items-center justify-center">
            <span className="font-['Poppins',sans-serif] text-[16px] font-medium text-white">
              Meal Plan
            </span>
          </div>
          <Link href="/workouts">
            <div className="bg-white border border-[#e5e7eb] h-[48px] w-[170px] rounded-[24px] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="font-['Poppins',sans-serif] text-[16px] font-medium text-[#374151]">
                Workouts
              </span>
            </div>
          </Link>
        </div>

        {/* Title & Calories Target */}
        <div className="absolute top-[175px] left-[42px] flex items-center justify-between w-[1350px]">
          <p className="font-['Poppins',sans-serif] font-medium text-[30px] text-black">
            Today's Meal Plan
          </p>
          <p className="font-['Poppins',sans-serif] font-medium text-[30px] text-[#ef4444]">
            {targetKcal} kcal Plan
          </p>
        </div>

        {/* Meal cards */}
        <div className="absolute top-[230px] left-[73px] w-[1300px] flex flex-col gap-4">
          {mealsToDisplay.map((meal, i) => (
            <div
              key={i}
              className="bg-white h-[120px] rounded-[18px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)] flex items-center px-5 gap-6 hover:shadow-md transition-shadow"
            >
              <div className="w-[90px] h-[90px] rounded-[12px] overflow-hidden bg-gray-100 shrink-0">
                <img
                  src={meal.img}
                  alt={meal.time}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="flex flex-col justify-center flex-1">
                <p className={`font-['Poppins',sans-serif] font-medium text-[24px] ${meal.color}`}>
                  {meal.time}
                </p>
                <p className="font-['Poppins',sans-serif] text-[16px] text-[#6b7280] mt-1">
                  {meal.items}
                </p>
              </div>
              <p className="font-['Poppins',sans-serif] text-[16px] text-[#22c55e] font-medium shrink-0">
                {meal.kcal}
              </p>
              <span className="text-gray-400 text-[24px] shrink-0">→</span>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded AI Chat Widget (Re-fetches and updates page on AI changes) */}
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