import { useState } from "react";

interface UserProfile {
  id?: string;
  name?: string;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  gender?: string;
  goal?: string;
  caloriesTarget?: number;
  activityLevel?: string;
  dietType?: string;
  allergies?: string;
  conditions?: string;
}

interface Props {
  profile: UserProfile | null;
  onClose: () => void;
  onSaved: () => void;
}

const GOALS = [
  "Lose weight",
  "Maintain weight",
  "Gain weight",
  "Build muscle",
  "Improve fitness",
];
const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary (desk job, little exercise)" },
  { value: "lightly_active", label: "Lightly active (1–3 days/week)" },
  { value: "moderately_active", label: "Moderately active (3–5 days/week)" },
  { value: "very_active", label: "Very active (6–7 days/week)" },
  { value: "extra_active", label: "Extra active (athlete / physical job)" },
];

export function ProfileEditModal({ profile, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    weightKg: profile?.weightKg?.toString() ?? "",
    heightCm: profile?.heightCm?.toString() ?? "",
    age: profile?.age?.toString() ?? "",
    gender: profile?.gender ?? "",
    goal: profile?.goal ?? "Maintain weight",
    activityLevel: profile?.activityLevel ?? "moderately_active",
    dietType: profile?.dietType ?? "",
    allergies: profile?.allergies ?? "",
    conditions: profile?.conditions ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const body: Record<string, any> = { goal: form.goal, activityLevel: form.activityLevel };
      if (form.name) body.name = form.name;
      if (form.weightKg) body.weightKg = parseFloat(form.weightKg);
      if (form.heightCm) body.heightCm = parseFloat(form.heightCm);
      if (form.age) body.age = parseInt(form.age);
      if (form.gender) body.gender = form.gender;
      if (form.dietType) body.dietType = form.dietType;
      if (form.allergies) body.allergies = form.allergies;
      if (form.conditions) body.conditions = form.conditions;

      const res = await fetch(`${import.meta.env.BASE_URL}api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#22c55e] px-6 py-5 rounded-t-[24px] flex items-center justify-between">
          <div>
            <h2 className="font-['Poppins',sans-serif] font-bold text-white text-[18px]">
              My Health Profile
            </h2>
            <p className="text-white/80 text-[13px] font-['Inter',sans-serif] mt-0.5">
              Your data is saved to the database and updates the dashboard
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
              Your Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Priya"
              className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          {/* Weight + Height */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
                Weight (kg)
              </label>
              <input
                type="number"
                value={form.weightKg}
                onChange={(e) => set("weightKg", e.target.value)}
                placeholder="e.g. 68"
                min={20} max={300}
                className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
                Height (cm)
              </label>
              <input
                type="number"
                value={form.heightCm}
                onChange={(e) => set("heightCm", e.target.value)}
                placeholder="e.g. 165"
                min={100} max={250}
                className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e]"
              />
            </div>
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
                Age
              </label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="e.g. 28"
                min={10} max={110}
                className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e] bg-white"
              >
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
              Health Goal
            </label>
            <select
              value={form.goal}
              onChange={(e) => set("goal", e.target.value)}
              className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e] bg-white"
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
              Activity Level
            </label>
            <select
              value={form.activityLevel}
              onChange={(e) => set("activityLevel", e.target.value)}
              className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e] bg-white"
            >
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>

          {/* Diet type + Allergies */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
                Diet Type
              </label>
              <input
                type="text"
                value={form.dietType}
                onChange={(e) => set("dietType", e.target.value)}
                placeholder="e.g. Vegetarian"
                className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
                Allergies
              </label>
              <input
                type="text"
                value={form.allergies}
                onChange={(e) => set("allergies", e.target.value)}
                placeholder="e.g. Lactose"
                className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e]"
              />
            </div>
          </div>

          {/* Health conditions */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1 font-['Inter',sans-serif]">
              Health Conditions (optional)
            </label>
            <input
              type="text"
              value={form.conditions}
              onChange={(e) => set("conditions", e.target.value)}
              placeholder="e.g. Diabetes, Hypertension"
              className="w-full h-[42px] rounded-[10px] border border-gray-200 px-4 text-[14px] font-['Inter',sans-serif] focus:outline-none focus:border-[#22c55e]"
            />
          </div>

          {error && (
            <p className="text-red-500 text-[13px] font-['Inter',sans-serif]">{error}</p>
          )}

          {/* Save */}
          <button
            onClick={save}
            disabled={saving}
            className="w-full h-[46px] bg-[#22c55e] disabled:bg-gray-200 text-white font-bold text-[15px] rounded-[12px] hover:bg-green-600 transition-colors cursor-pointer disabled:cursor-not-allowed font-['Poppins',sans-serif] mt-2"
          >
            {saving ? "Saving…" : "Save & Update Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
