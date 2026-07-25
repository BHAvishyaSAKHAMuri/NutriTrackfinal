import { useState } from "react";

interface Props {
  onLogged: () => void;
}

type Tab = "meal" | "workout";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const EXERCISES = ["Walking", "Running", "Cycling", "Yoga", "Gym", "Swimming", "HIIT", "Other"];

export function QuickLogWidget({ onLogged }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("meal");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Meal form
  const [mealType, setMealType] = useState("Lunch");
  const [foodItem, setFoodItem] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [fatG, setFatG] = useState("");

  // Workout form
  const [exercise, setExercise] = useState("Walking");
  const [durationMin, setDurationMin] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [notes, setNotes] = useState("");

  const resetForms = () => {
    setFoodItem(""); setCalories(""); setProteinG(""); setCarbsG(""); setFatG("");
    setDurationMin(""); setCaloriesBurned(""); setNotes("");
  };

  const logMeal = async () => {
    if (!foodItem && !calories) return;
    setSaving(true);
    try {
      const profileRes = await fetch(`${import.meta.env.BASE_URL}api/profile`);
      const profile = await profileRes.json();

      await fetch(`${import.meta.env.BASE_URL}api/nutrition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          mealType: mealType.toLowerCase(),
          foodItem: foodItem || null,
          calories: calories ? parseInt(calories) : null,
          proteinG: proteinG ? parseFloat(proteinG) : null,
          carbsG: carbsG ? parseFloat(carbsG) : null,
          fatG: fatG ? parseFloat(fatG) : null,
        }),
      });
      resetForms();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onLogged();
    } finally {
      setSaving(false);
    }
  };

  const logWorkout = async () => {
    if (!exercise && !durationMin) return;
    setSaving(true);
    try {
      const profileRes = await fetch(`${import.meta.env.BASE_URL}api/profile`);
      const profile = await profileRes.json();

      await fetch(`${import.meta.env.BASE_URL}api/workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          exercise,
          durationMin: durationMin ? parseInt(durationMin) : null,
          caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : null,
          notes: notes || null,
        }),
      });
      resetForms();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onLogged();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[100px] right-8 w-[64px] h-[64px] rounded-full bg-[#ff6b81] shadow-[0px_8px_30px_rgba(255,107,129,0.45)] flex items-center justify-center hover:bg-pink-500 transition-all hover:scale-105 z-50 cursor-pointer"
        aria-label="Log meal or workout"
        title="Log meal or workout"
      >
        <span className="text-[26px]">📝</span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[420px]">
            {/* Header */}
            <div className="bg-[#ff6b81] px-5 py-4 rounded-t-[24px] flex items-center justify-between">
              <p className="font-['Poppins',sans-serif] font-bold text-white text-[16px]">
                Quick Log
              </p>
              <button
                onClick={() => setOpen(false)}
                className="w-[30px] h-[30px] rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(["meal", "workout"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-[14px] font-semibold font-['Inter',sans-serif] capitalize transition-colors cursor-pointer ${
                    tab === t
                      ? "text-[#ff6b81] border-b-2 border-[#ff6b81]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t === "meal" ? "🍽️ Meal" : "🏋️ Workout"}
                </button>
              ))}
            </div>

            <div className="p-5 flex flex-col gap-3">
              {tab === "meal" ? (
                <>
                  {/* Meal type */}
                  <div className="flex gap-2 flex-wrap">
                    {MEAL_TYPES.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMealType(m)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-semibold font-['Inter',sans-serif] cursor-pointer transition-colors ${
                          mealType === m
                            ? "bg-[#ff6b81] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Food item (e.g. Dal rice, 2 rotis)"
                    value={foodItem}
                    onChange={(e) => setFoodItem(e.target.value)}
                    className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[13.5px] font-['Inter',sans-serif] focus:outline-none focus:border-[#ff6b81]"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Calories (kcal)"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      className="h-[42px] rounded-[10px] border border-gray-200 px-4 text-[13.5px] font-['Inter',sans-serif] focus:outline-none focus:border-[#ff6b81]"
                    />
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={proteinG}
                      onChange={(e) => setProteinG(e.target.value)}
                      className="h-[42px] rounded-[10px] border border-gray-200 px-4 text-[13.5px] font-['Inter',sans-serif] focus:outline-none focus:border-[#ff6b81]"
                    />
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={carbsG}
                      onChange={(e) => setCarbsG(e.target.value)}
                      className="h-[42px] rounded-[10px] border border-gray-200 px-4 text-[13.5px] font-['Inter',sans-serif] focus:outline-none focus:border-[#ff6b81]"
                    />
                    <input
                      type="number"
                      placeholder="Fat (g)"
                      value={fatG}
                      onChange={(e) => setFatG(e.target.value)}
                      className="h-[42px] rounded-[10px] border border-gray-200 px-4 text-[13.5px] font-['Inter',sans-serif] focus:outline-none focus:border-[#ff6b81]"
                    />
                  </div>

                  <button
                    onClick={logMeal}
                    disabled={saving || (!foodItem && !calories)}
                    className="w-full h-[44px] bg-[#ff6b81] disabled:bg-gray-200 text-white font-bold text-[14px] rounded-[12px] hover:bg-pink-500 transition-colors cursor-pointer disabled:cursor-not-allowed font-['Poppins',sans-serif]"
                  >
                    {saved ? "✓ Logged!" : saving ? "Logging…" : "Log Meal"}
                  </button>
                </>
              ) : (
                <>
                  {/* Exercise type */}
                  <div className="flex gap-2 flex-wrap">
                    {EXERCISES.map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setExercise(ex)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-semibold font-['Inter',sans-serif] cursor-pointer transition-colors ${
                          exercise === ex
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Duration (min)"
                      value={durationMin}
                      onChange={(e) => setDurationMin(e.target.value)}
                      className="h-[42px] rounded-[10px] border border-gray-200 px-4 text-[13.5px] font-['Inter',sans-serif] focus:outline-none focus:border-orange-400"
                    />
                    <input
                      type="number"
                      placeholder="Calories burned"
                      value={caloriesBurned}
                      onChange={(e) => setCaloriesBurned(e.target.value)}
                      className="h-[42px] rounded-[10px] border border-gray-200 px-4 text-[13.5px] font-['Inter',sans-serif] focus:outline-none focus:border-orange-400"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[13.5px] font-['Inter',sans-serif] focus:outline-none focus:border-orange-400"
                  />

                  <button
                    onClick={logWorkout}
                    disabled={saving || (!exercise && !durationMin)}
                    className="w-full h-[44px] bg-orange-500 disabled:bg-gray-200 text-white font-bold text-[14px] rounded-[12px] hover:bg-orange-600 transition-colors cursor-pointer disabled:cursor-not-allowed font-['Poppins',sans-serif]"
                  >
                    {saved ? "✓ Logged!" : saving ? "Logging…" : "Log Workout"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
