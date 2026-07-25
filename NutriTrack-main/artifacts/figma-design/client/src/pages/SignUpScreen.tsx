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
    // Step 0: health goals (all selected)
    const goals = selected[0] || [];
    // Step 1: personal details (Full Name, Age, Height (cm), Weight (kg))
    // Step 2: health conditions
    const conditions = (selected[2] || []).filter((c) => c !== "None of the above");
    // Step 3: diet preference
    const dietPref = (selected[3] || [])[0];
    // Step 4: daily food budget
    const budget = (selected[4] || [])[0];

    // Save all selected goals as a comma-separated string
    const allGoals = goals.map((g) => GOAL_MAP[g] || g);

    // Name: prefer signup-step name, fall back to createAccount name stored in sessionStorage
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
    <div className="min-h-screen overflow-x-auto bg-white">
      <div className="relative w-[1481px] min-h-screen">
        {/* Header */}
        <header className="absolute h-[80px] left-0 top-0 w-[1481px] bg-white shadow-sm flex items-center z-10">
          <Link href="/">
            <span className="absolute left-[75px] font-['Poppins',sans-serif] text-[28px] font-bold cursor-pointer">
              <span className="text-[#22c55e]">Nutri</span>
              <span className="text-[#ff6b81]">Track</span>
            </span>
          </Link>
          <Link href="/">
            <button className="absolute left-[20px] top-[25px] text-gray-400 hover:text-gray-600 cursor-pointer text-[28px]">←</button>
          </Link>
        </header>

        {/* Progress dots */}
        <div className="absolute top-[110px] left-1/2 -translate-x-1/2 flex items-center gap-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${i === step ? "w-8 h-3 bg-[#22c55e]" : i < step ? "w-3 h-3 bg-[#22c55e] opacity-50" : "w-3 h-3 bg-gray-300"}`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="absolute top-[135px] left-[364px] w-[733px] h-[4px] bg-gray-200 rounded-full">
          <div
            className="h-full bg-[#22c55e] rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Images column */}
        <div className="absolute top-[200px] left-[80px] w-[250px] flex flex-col gap-4">
          <div className="w-full h-[200px] rounded-[20px] overflow-hidden bg-gray-100">
            <img
              src="/figmaAssets/signup-hero.png"
              alt="Healthy food"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="w-full h-[200px] rounded-[20px] overflow-hidden bg-gray-100">
            <img
              src="/figmaAssets/signup-food.png"
              alt="Nutrition"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="w-full h-[120px] rounded-[20px] overflow-hidden bg-[#f0fdf4] flex items-center justify-center">
            <img
              src="/figmaAssets/signup-ellipse26.png"
              alt="Health"
              className="w-[80px] h-[80px] rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </div>

        {/* Main form */}
        <div className="absolute top-[160px] left-[364px] w-[733px]">
          <h1 className="font-['Poppins',sans-serif] font-bold text-[36px] text-black leading-tight mb-2">{current.title}</h1>
          <p className="font-['Poppins',sans-serif] text-[18px] text-gray-500 mb-8">{current.subtitle}</p>

          {(current.type === "multi" || current.type === "single") && current.options && (
            <div className="flex flex-wrap gap-4">
              {current.options.map((option) => (
                <button
                  key={option}
                  onClick={() => toggle(option)}
                  className={`px-6 py-3 rounded-[24px] font-['Poppins',sans-serif] text-[18px] font-medium border-2 transition-all cursor-pointer ${
                    isSelected(option)
                      ? "bg-[#22c55e] border-[#22c55e] text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:border-[#22c55e]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {current.type === "form" && current.fields && (
            <div className="grid grid-cols-2 gap-6">
              {current.fields.map((field) => (
                <div key={field.label}>
                  <label className="block font-['Poppins',sans-serif] font-bold text-[16px] text-black mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formValues[field.label] || ""}
                    onChange={(e) => setFormValues({ ...formValues, [field.label]: e.target.value })}
                    className="w-full h-[50px] border border-[#a7aaaf] rounded-[10px] px-4 font-['Poppins',sans-serif] text-[16px] text-gray-700 focus:outline-none focus:border-[#22c55e] transition-colors"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={saving}
            className="mt-10 w-full h-[74px] bg-[#22c55e] disabled:bg-green-300 rounded-[24px] text-white font-['Poppins',sans-serif] font-bold text-[32px] flex items-center justify-center gap-4 hover:bg-green-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : step < totalSteps - 1 ? "Next" : "Get My Plan"}
            {!saving && <span className="text-[24px]">→</span>}
          </button>

          <p className="text-center mt-4 font-['Poppins',sans-serif] text-[16px] text-gray-500">
            Step {step + 1} of {totalSteps}
          </p>
        </div>

        {/* Right side image */}
        <div className="absolute top-[200px] right-[80px] w-[220px]">
          <div className="w-full h-[300px] rounded-[20px] overflow-hidden bg-gray-100">
            <img
              src="/figmaAssets/signup-rect60.png"
              alt="Healthy lifestyle"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
