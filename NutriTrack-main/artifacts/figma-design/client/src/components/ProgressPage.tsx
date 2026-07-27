import React, { useEffect, useState } from "react";

interface ProgressData {
  currentWeight?: number;
  targetWeight?: number;
  totalCaloriesBurned?: number;
  totalWorkouts?: number;
  bmi?: number;
  bmiCategory?: string;
}

export function ProgressPage() {
  const [data, setData] = useState<ProgressData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch today's summary & profile stats
    Promise.all([
      fetch("/api/profile/today").then((res) => res.json()).catch(() => ({})),
      fetch("/api/profile").then((res) => res.json()).catch(() => ({})),
    ]).then(([todayData, profileData]) => {
      setData({
        currentWeight: profileData?.weightKg || 68,
        targetWeight: profileData?.targetWeight || 60,
        totalCaloriesBurned: todayData?.totalCaloriesBurned || 0,
        totalWorkouts: todayData?.workouts?.length || 0,
        bmi: profileData?.bmi || 28.6,
        bmiCategory: profileData?.bmiCategory || "Overweight",
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading progress...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Your Health & Fitness Progress</h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weight Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Current Weight</p>
          <div className="text-3xl font-bold text-emerald-600 mt-2">
            {data.currentWeight} <span className="text-base font-normal text-gray-500">kg</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Goal: {data.targetWeight} kg</p>
        </div>

        {/* Calories Burned Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Calories Burned Today</p>
          <div className="text-3xl font-bold text-orange-500 mt-2">
            {data.totalCaloriesBurned} <span className="text-base font-normal text-gray-500">kcal</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{data.totalWorkouts} workout(s) logged</p>
        </div>

        {/* BMI Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Body Mass Index (BMI)</p>
          <div className="text-3xl font-bold text-blue-600 mt-2">{data.bmi}</div>
          <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
            {data.bmiCategory}
          </span>
        </div>
      </div>

      {/* Fitness History Box */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Activity & Goal Summary</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Keep logging your meals and workouts through the <strong>NutriTrack AI Assistant</strong> or quick logs to see your daily calorie balance update in real time!
        </p>
      </div>
    </div>
  );
}