import { useState } from "react";
import { Link } from "wouter";

function calcBMI(heightCm: number, weightKg: number): number {
  const h = heightCm / 100;
  return parseFloat((weightKg / (h * h)).toFixed(1));
}

function getBMICategory(bmi: number): { label: string; color: string; textColor: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-200", textColor: "text-blue-600" };
  if (bmi < 25) return { label: "Normal Weight", color: "bg-[#22c55e]", textColor: "text-[#22c55e]" };
  if (bmi < 30) return { label: "Overweight", color: "bg-yellow-400", textColor: "text-yellow-600" };
  if (bmi < 35) return { label: "Obese", color: "bg-orange-500", textColor: "text-orange-600" };
  return { label: "Severely Obese", color: "bg-red-600", textColor: "text-red-600" };
}

const bmiRanges = [
  { label: "Underweight", range: "<18.5", color: "bg-blue-200" },
  { label: "Normal", range: "18.5–24.9", color: "bg-[#22c55e]" },
  { label: "Overweight", range: "25–29.9", color: "bg-yellow-400" },
  { label: "Obese", range: "30–34.9", color: "bg-orange-500" },
  { label: "Severely Obese", range: ">35", color: "bg-red-600" },
];

export default function BMICalculatorScreen() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      setResult(calcBMI(h, w));
    }
  };

  const category = result !== null ? getBMICategory(result) : null;

  return (
    <div className="min-h-screen overflow-x-auto bg-[#f1f5f9]">
      <div className="relative w-[1440px] min-h-screen">
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
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">Dashboard</span>
            </Link>
            <Link href="/meal-plan">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">Meal Plan</span>
            </Link>
            <Link href="/bmi">
              <span className="font-bold text-[20px] text-[#22c55e] cursor-pointer font-['Readex_Pro',sans-serif]">BMI</span>
            </Link>
            <Link href="/workouts">
              <span className="font-bold text-[20px] text-black cursor-pointer font-['Readex_Pro',sans-serif]">Workouts</span>
            </Link>
          </nav>
          <Link href="/signup">
            <button className="absolute right-[20px] top-[18px] bg-[#22c55e] text-white font-bold text-[16px] px-5 py-2 rounded-[12px] hover:bg-green-600 transition-colors cursor-pointer font-['Inter',sans-serif]">
              Get started →
            </button>
          </Link>
        </header>

        {/* Title */}
        <div className="absolute top-[100px] left-[150px]">
          <h1 className="font-['Poppins',sans-serif] font-bold text-[36px] text-black leading-tight">BMI Calculator</h1>
          <p className="font-['Poppins',sans-serif] text-[16px] text-[#888]">Calculate your Body Mass Index to understand your health status.</p>
        </div>

        {/* Left form card */}
        <div className="absolute bg-white h-[720px] left-[61px] rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] top-[210px] w-[700px] px-[53px] py-[50px]">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {/* Height */}
            <div>
              <label className="block font-['Poppins',sans-serif] font-bold text-[14px] text-black mb-2">Height</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter height (cm)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full h-[50px] border border-[#a7aaaf] rounded-[10px] px-4 font-['Poppins',sans-serif] text-[14px] text-[#888] focus:outline-none focus:border-[#22c55e] transition-colors"
                />
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block font-['Poppins',sans-serif] font-bold text-[14px] text-black mb-2">Weight</label>
              <input
                type="number"
                placeholder="Enter weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full h-[50px] border border-[#a7aaaf] rounded-[10px] px-4 font-['Poppins',sans-serif] text-[14px] text-[#888] focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block font-['Poppins',sans-serif] font-bold text-[14px] text-black mb-2">Age</label>
              <input
                type="number"
                placeholder="Enter age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full h-[50px] border border-[#a7aaaf] rounded-[10px] px-4 font-['Poppins',sans-serif] text-[14px] text-[#888] focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block font-['Poppins',sans-serif] font-bold text-[14px] text-black mb-2">Gender</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setGender("female")}
                  className={`flex-1 h-[42px] rounded-[21px] font-['Poppins',sans-serif] text-[16px] font-medium border-2 transition-all cursor-pointer ${gender === "female" ? "bg-[#22c55e] border-[#22c55e] text-white" : "bg-white border-gray-300 text-gray-600 hover:border-[#22c55e]"}`}
                >
                  Female
                </button>
                <button
                  onClick={() => setGender("male")}
                  className={`flex-1 h-[42px] rounded-[21px] font-['Poppins',sans-serif] text-[16px] font-medium border-2 transition-all cursor-pointer ${gender === "male" ? "bg-[#22c55e] border-[#22c55e] text-white" : "bg-white border-gray-300 text-gray-600 hover:border-[#22c55e]"}`}
                >
                  Male
                </button>
              </div>
            </div>
          </div>

          {/* Calculate button */}
          <button
            onClick={handleCalculate}
            className="mt-8 w-[280px] h-[50px] bg-[#22c55e] rounded-[10px] text-white font-['Poppins',sans-serif] font-bold text-[16px] hover:bg-green-600 transition-colors cursor-pointer"
          >
            Calculate BMI
          </button>

          {/* Results table */}
          {result !== null && category && (
            <div className="mt-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500">Your BMI</p>
                  <p className="font-['Poppins',sans-serif] text-[28px] font-bold text-black">{result}</p>
                </div>
                <div>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500">Ideal BMI range</p>
                  <p className="font-['Poppins',sans-serif] text-[24px] font-medium text-[#22c55e]">18.5–24.9</p>
                </div>
                <div>
                  <p className="font-['Poppins',sans-serif] text-[14px] text-gray-500">Recommended</p>
                  <p className="font-['Poppins',sans-serif] text-[24px] font-bold text-black">1900 kcal</p>
                  <p className="font-['Poppins',sans-serif] text-[12px] text-gray-400">Maintain weight</p>
                </div>
              </div>
              {/* Tip */}
              <div className="mt-4 bg-[rgba(128,239,128,0.3)] rounded-[15px] px-5 py-4">
                <p className="font-['Poppins',sans-serif] text-[14px] font-semibold text-black">💡 Tip of the day</p>
                <p className="font-['Poppins',sans-serif] text-[14px] text-gray-700 mt-1">Drink more water and stay active. Small steps lead to big changes!</p>
              </div>
            </div>
          )}
        </div>

        {/* Right results card */}
        <div className="absolute top-[210px] left-[821px] w-[560px]">
          {/* BMI result card */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
              <p className="font-['Poppins',sans-serif] font-bold text-[18px] text-black">Your BMI Result</p>
            </div>
            <div className="text-center py-4">
              {result !== null && category ? (
                <>
                  <p className="font-['Poppins',sans-serif] text-[72px] font-bold text-black leading-none">{result}</p>
                  <span className={`inline-block mt-3 px-4 py-2 rounded-[8px] ${category.color} text-white font-['Poppins',sans-serif] font-semibold text-[16px]`}>
                    {category.label}
                  </span>
                </>
              ) : (
                <div className="py-8">
                  <p className="font-['Poppins',sans-serif] text-[18px] text-gray-400">Enter your details and calculate</p>
                  <p className="font-['Poppins',sans-serif] text-[72px] font-bold text-gray-200 leading-none">—</p>
                </div>
              )}
            </div>
          </div>

          {/* BMI Scale chart */}
          <div className="bg-[#f8fafc] rounded-[16px] p-6">
            <p className="font-['Poppins',sans-serif] font-bold text-[16px] text-black mb-4">BMI Scale</p>
            <div className="flex gap-2">
              {bmiRanges.map((r, i) => {
                const isActive = result !== null &&
                  ((i === 0 && result < 18.5) ||
                  (i === 1 && result >= 18.5 && result < 25) ||
                  (i === 2 && result >= 25 && result < 30) ||
                  (i === 3 && result >= 30 && result < 35) ||
                  (i === 4 && result >= 35));
                return (
                  <div key={r.label} className="flex-1 flex flex-col items-center">
                    <div className={`h-[94px] w-full rounded-[12px] ${r.color} ${isActive ? "ring-2 ring-offset-2 ring-gray-800 scale-105" : ""} transition-all flex flex-col items-center justify-center`}>
                      <p className="text-white font-['Poppins',sans-serif] font-bold text-[10px] text-center px-1">{r.range}</p>
                    </div>
                    <p className={`text-[9px] text-center mt-1 font-['Poppins',sans-serif] font-semibold ${isActive ? "text-black font-bold" : "text-gray-500"}`}>{r.label}</p>
                  </div>
                );
              })}
            </div>
            {result !== null && (
              <p className="mt-3 font-['Poppins',sans-serif] text-[13px] text-gray-600">
                Your BMI of <strong>{result}</strong> is highlighted above
              </p>
            )}
          </div>

          {/* BMI illustration */}
          <div className="mt-4 flex justify-center">
            <img
              src="/figmaAssets/bmi-illustration.png"
              alt="BMI illustration"
              className="h-[120px] w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
