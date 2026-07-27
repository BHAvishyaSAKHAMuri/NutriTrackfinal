import { useState } from "react";
import { Link, useLocation } from "wouter";

const steps = [
  {
    title: "What are your health goals?",
    subtitle: "Select all that apply",
    options: ["Weight Loss", "Muscle Gain", "Maintain Weight", "Improve Stamina", "Better Nutrition", "Manage Health Condition"],
    type: "multi",
  },
  {
    title: "Tell us about yourself",
    subtitle: "We'll personalize your plan",
    fields: [
      { label: "Full Name", placeholder: "Enter your name", type: "text" },
      { label: "Age", placeholder: "Enter your age", type: "number" },
      { label: "Height (cm)", placeholder: "Enter height in cm", type: "number" },
      { label: "Weight (kg)", placeholder: "Enter weight in kg", type: "number" },
    ],
    type: "form",
  },
  {
    title: "Any health conditions?",
    subtitle: "So we can tailor your plan safely",
    options: ["PCOS", "Diabetes", "Thyroid", "Hypertension", "None of the above"],
    type: "multi",
  },
  {
    title: "Choose your diet preference",
    subtitle: "We'll build meals around your choices",
    options: ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian", "No Preference"],
    type: "single",
  },
  {
    title: "What's your daily budget for food?",
    subtitle: "We'll suggest affordable meal options",
    options: ["Under 100Rs/Day", "100–200Rs/Day", "200–400Rs/Day", "400+Rs/Day"],
    type: "single",
  },
  {
    title: "Any allergies?",
    subtitle: "We'll suggest accordingly ",
    options: ["None", "Peanuts", "Dairy", "Gluten", "Eggs"],
    type: "single",
  },
];

const GOAL_MAP: Record<string, string> = {
  "Weight Loss": "Lose weight",
  "Muscle Gain": "Gain muscle",
  "Maintain Weight": "Maintain weight",
  "Improve Stamina": "Improve stamina",
  "Better Nutrition": "Better nutrition",
  "Manage Health Condition": "Manage health condition",
};

export default function SignUpScreen() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<number, string[]>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [, navigate] = useLocation();

  const current = steps[step];
  const totalSteps = steps.length;

  const toggle = (option: string) => {
    const prev = selected[step] || [];
    if (current.type === "single") {
      setSelected({ ...selected, [step]: [option] });
    } else {
      if (prev.includes(option)) {
        setSelected({ ...selected, [step]: prev.filter((o) => o !== option) });
      } else {
        setSelected({ ...selected, [step]: [...prev, option] });
      }
    }
  };

  const isSelected = (option: string) => (selected[step] || []).includes(option);

  const saveProfile = async () => {
    const goals = selected[0] || [];
    const conditions = (selected[2] || []).filter((c) => c !== "None of the above");
    const dietPref = (selected[3] || [])[0];
    const budget = (selected[4] || [])[0];

    const allGoals = goals.map((g) => GOAL_MAP[g] || g);
    const accountName = sessionStorage.getItem("nutritrack_name") || "";
    const name = formValues["Full Name"]?.trim() || accountName || undefined;

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (allGoals.length > 0) updates.goal = allGoals.join(", ");

    const age = formValues["Age"] ? parseInt(formValues["Age"], 10) : NaN;
    if (!isNaN(age) && age > 0) updates.age = age;

    const heightCm = formValues["Height (cm)"] ? parseFloat(formValues["Height (cm)"]) : NaN;
    if (!isNaN(heightCm) && heightCm > 0) updates.heightCm = heightCm;

    const weightKg = formValues["Weight (kg)"] ? parseFloat(formValues["Weight (kg)"]) : NaN;
    if (!isNaN(weightKg) && weightKg > 0) updates.weightKg = weightKg;

    if (conditions.length > 0) updates.conditions = conditions.join(", ");
    if (dietPref && dietPref !== "No Preference") updates.dietType = dietPref;
    if (budget) updates.lifestyle = `Food budget: ${budget}`;

    if (Object.keys(updates).length > 0) {
      try {
        await fetch(`${import.meta.env.BASE_URL}api/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updates),
        });
      } catch (e) {
        console.error("Failed to save signup profile", e);
      }
    }
    sessionStorage.removeItem("nutritrack_name");
  };

  const handleNext = async () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setSaving(true);
      await saveProfile();
      setSaving(false);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      
      {/* ── HEADER ── */}
      <header className="w-full h-20 px-6 sm:px-12 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="text-gray-400 hover:text-gray-600 cursor-pointer text-2xl transition-colors">
              ←
            </button>
          </Link>
          <Link href="/">
            <span className="font-['Poppins',sans-serif] text-2xl font-bold cursor-pointer">
              <span className="text-[#22c55e]">Nutri</span>
              <span className="text-[#ff6b81]">Track</span>
            </span>
          </Link>
        </div>
      </header>

      {/* ── MAIN CENTERED ONBOARDING CARD ── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 flex flex-col items-center justify-center text-center">
        
        {/* Progress Dots */}
        <div className="flex items-center gap-2 mb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === step
                  ? "w-8 h-3 bg-[#22c55e]"
                  : i < step
                  ? "w-3 h-3 bg-[#22c55e] opacity-50"
                  : "w-3 h-3 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Continuous Progress Bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-10 overflow-hidden">
          <div
            className="h-full bg-[#22c55e] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step Title & Subtitle */}
        <h1 className="font-['Poppins',sans-serif] font-bold text-3xl sm:text-4xl text-gray-900 leading-tight mb-2">
          {current.title}
        </h1>
        <p className="font-['Poppins',sans-serif] text-base sm:text-lg text-gray-500 mb-8">
          {current.subtitle}
        </p>

        {/* Multi / Single Choice Pills */}
        {(current.type === "multi" || current.type === "single") && current.options && (
          <div className="flex flex-wrap justify-center gap-3 w-full mb-8">
            {current.options.map((option) => (
              <button
                key={option}
                onClick={() => toggle(option)}
                className={`px-6 py-3 rounded-full font-['Poppins',sans-serif] text-base font-medium border-2 transition-all cursor-pointer ${
                  isSelected(option)
                    ? "bg-[#22c55e] border-[#22c55e] text-white shadow-sm"
                    : "bg-white border-gray-200 text-gray-700 hover:border-[#22c55e]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Personal Details Form Inputs */}
        {current.type === "form" && current.fields && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full text-left mb-8">
            {current.fields.map((field) => (
              <div key={field.label}>
                <label className="block font-['Poppins',sans-serif] font-semibold text-sm text-gray-800 mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formValues[field.label] || ""}
                  onChange={(e) => setFormValues({ ...formValues, [field.label]: e.target.value })}
                  className="w-full h-12 border border-gray-300 rounded-xl px-4 font-['Poppins',sans-serif] text-sm text-gray-800 focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all"
                />
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleNext}
          disabled={saving}
          className="w-full h-14 bg-[#22c55e] disabled:bg-green-300 rounded-2xl text-white font-['Poppins',sans-serif] font-bold text-xl flex items-center justify-center gap-3 hover:bg-[#1eb454] transition-colors cursor-pointer shadow-md disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : step < totalSteps - 1 ? "Next" : "Get My Plan"}
          {!saving && <span className="text-xl">→</span>}
        </button>

        <p className="mt-4 font-['Poppins',sans-serif] text-sm text-gray-400">
          Step {step + 1} of {totalSteps}
        </p>

      </main>

      <div className="py-4" />
    </div>
  );
}