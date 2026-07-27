import { useState } from "react";
import { Link, useLocation } from "wouter";

const features = [
  { icon: "🥗", title: "Personalized", sub: "Meal plans", color: "bg-[#fff0eb]" },
  { icon: "💪", title: "Effective", sub: "Workouts", color: "bg-[#f0ebff]" },
  { icon: "📊", title: "Track Your", sub: "Progress", color: "bg-[#ebf5ff]" },
  { icon: "⏰", title: "Daily", sub: "Reminder", color: "bg-[#fffbeb]" },
];

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f5] flex items-center justify-center">
      <div className="relative w-full max-w-7xl min-h-screen flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 py-10 gap-12">

        {/* ── LEFT decorative panel (Left-Aligned) ── */}
        <div className="relative flex-1 flex flex-col justify-center items-start w-full">
          <Link href="/">
            <div className="mb-8 w-[38px] h-[38px] rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
              <span className="text-[18px] text-gray-500">←</span>
            </div>
          </Link>

          <div className="mb-10 text-left max-w-[560px]">
            <h2 className="font-['Poppins',sans-serif] font-bold text-[38px] sm:text-[48px] text-[#1f2937] leading-tight">
              Your personal <br />
              <span className="text-[#22c55e]">health coach</span> <br />
              awaits you 🌿
            </h2>
            <p className="font-['Poppins',sans-serif] text-[16px] text-[#6b7280] mt-4">
              Thousands of people are already living healthier lives with NutriTrack.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-[560px]">
            {features.map((f, i) => (
              <div key={i} className={`${f.color} rounded-[18px] p-5 flex items-center gap-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]`}>
                <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center text-[24px] shadow-sm shrink-0 overflow-hidden">
                  <img
                    src={`/figmaAssets/login-avatar${i + 1}.png`}
                    alt={f.title}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = "none";
                      if (t.parentElement) t.parentElement.innerText = f.icon;
                    }}
                  />
                </div>
                <div>
                  <p className="font-['Poppins',sans-serif] font-bold text-[14px] text-[#1f2937] leading-tight">{f.title}</p>
                  <p className="font-['Poppins',sans-serif] text-[11px] text-[#6b7280]">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3 bg-white rounded-[14px] px-5 py-3 shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                  <img
                    src={`/figmaAssets/login-avatar${n}.png`}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              ))}
            </div>
            <p className="font-['Poppins',sans-serif] text-[13px] text-[#6b7280]">
              <strong className="text-[#1f2937]">12,000+</strong> users already on their journey
            </p>
          </div>
        </div>

        {/* ── RIGHT form card (Left-Aligned Text) ── */}
        <div className="w-full max-w-[500px] flex items-center justify-center">
          <div className="bg-white rounded-[24px] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.12)] w-full px-8 sm:px-12 py-10 text-left">

            <Link href="/">
              <p className="font-['Poppins',sans-serif] text-[20px] font-semibold mb-6 cursor-pointer">
                <span className="text-[#22c55e]">Nutri</span>
                <span className="text-[#ff6b81]">Track</span>
              </p>
            </Link>

            <h1 className="font-['Inter',sans-serif] font-bold text-[36px] text-[#111827] leading-tight mb-1">Login</h1>
            <p className="font-['Poppins',sans-serif] text-[15px] text-[#6b7280] mb-8">Welcome back! Please login to continue.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <p className="font-['Inter',sans-serif] font-medium text-[14px] text-[#374151] mb-2">Email Address</p>
                <div className="relative h-[54px] rounded-[14px] border border-[#e5e7eb] bg-white">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="absolute inset-0 w-full h-full px-4 font-['Inter',sans-serif] text-[14px] text-gray-700 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-['Inter',sans-serif] font-medium text-[14px] text-[#374151]">Password</p>
                  <Link href="/forgot-password">
                    <span className="font-['Inter',sans-serif] font-medium text-[13px] text-[#c10d46] hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </Link>
                </div>
                <div className="relative h-[54px] rounded-[14px] border border-[#e5e7eb] bg-white">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="absolute inset-0 w-full h-full px-4 pr-12 font-['Inter',sans-serif] text-[14px] text-gray-700 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-[16px]"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="font-['Poppins',sans-serif] text-[13px] text-red-500 text-left -mt-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[54px] bg-[rgba(193,13,70,0.85)] hover:bg-[#c10d46] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-['Inter',sans-serif] font-semibold text-[16px] rounded-[14px] transition-colors cursor-pointer mt-1"
              >
                {loading ? "Logging in…" : "Login"}
              </button>
            </form>

            <p className="font-['Inter',sans-serif] font-semibold text-[14px] text-[#6b7280] mt-8 text-center">
              Don't have an account?{" "}
              <Link href="/create-account">
                <span className="text-[#22c55e] hover:underline cursor-pointer">Create account</span>
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}