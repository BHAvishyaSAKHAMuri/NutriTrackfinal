import { useState } from "react";
import { Link, useLocation } from "wouter";

const features = [
  { icon: "🥗", title: "Personalized", sub: "Nutrition", color: "bg-[#f0fdf4]" },
  { icon: "🏋️", title: "Workout", sub: "Plans", color: "bg-[#f0f9ff]" },
  { icon: "📊", title: "Track", sub: "Your progress", color: "bg-[#fdf4ff]" },
  { icon: "💧", title: "Stay", sub: "Hydrated", color: "bg-[#f0fdf4]" },
];

export default function CreateAccountScreen() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [, navigate] = useLocation();

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { label: "Weak", bar: "w-1/4", color: "bg-red-400", text: "text-red-500" };
    if (s === 2) return { label: "Fair", bar: "w-2/4", color: "bg-yellow-400", text: "text-yellow-600" };
    if (s === 3) return { label: "Good", bar: "w-3/4", color: "bg-blue-400", text: "text-blue-600" };
    return { label: "Strong", bar: "w-full", color: "bg-[#22c55e]", text: "text-[#22c55e]" };
  })();

  const mismatch = form.confirm.length > 0 && form.password !== form.confirm;
  const matched = form.confirm.length > 0 && !mismatch;

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch) return;
    setServerError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: form.email.trim(),   // use email as username
          email: form.email.trim(),
          password: form.password,
        }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error || "Registration failed.");
      // Persist name so the onboarding flow can use it
      if (form.name) sessionStorage.setItem("nutritrack_name", form.name);
      navigate("/signup");
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-auto bg-[#fafff5]">
      <div className="relative w-[1440px] min-h-screen flex">

        {/* ── LEFT decorative panel ── */}
        <div className="relative flex-1 flex flex-col justify-center items-center px-16 py-12">
          <Link href="/">
            <div className="absolute top-10 left-8 w-[38px] h-[38px] rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
              <span className="text-[18px] text-gray-500">←</span>
            </div>
          </Link>

          <div className="mb-14 text-center max-w-[540px]">
            <h2 className="font-['Poppins',sans-serif] font-bold text-[46px] text-[#1f2937] leading-tight">
              Build your <br />
              <span className="text-[#22c55e]">healthiest self</span> <br />
              starting today 🌱
            </h2>
            <p className="font-['Poppins',sans-serif] text-[16px] text-[#6b7280] mt-4">
              Get a plan built around your body, goals, and lifestyle in minutes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5 w-full max-w-[540px]">
            {features.map((f, i) => (
              <div key={i} className={`${f.color} rounded-[18px] p-5 flex items-center gap-4 shadow-[0px_4px_20px_rgba(0,0,0,0.04)]`}>
                <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center text-[24px] shadow-sm shrink-0 overflow-hidden">
                  <img
                    src={`/figmaAssets/signup-avatar${i + 1}.png`}
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

          <div className="mt-12 flex items-center gap-3 bg-white rounded-[14px] px-5 py-3 shadow-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                  <img
                    src={`/figmaAssets/signup-avatar${n}.png`}
                    className="w-full h-full object-cover"
                    alt=""
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              ))}
            </div>
            <p className="font-['Poppins',sans-serif] text-[13px] text-[#6b7280]">
              Join <strong className="text-[#1f2937]">12,000+</strong> members already thriving
            </p>
          </div>
        </div>

        {/* ── RIGHT form card ── */}
        <div className="flex items-center justify-center py-10 pr-16">
          <div className="bg-white rounded-[24px] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.25)] w-[623px] px-12 py-10">

            <Link href="/">
              <p className="font-['Poppins',sans-serif] text-[20px] font-semibold mb-4 cursor-pointer">
                <span className="text-[#22c55e]">Nutri</span>
                <span className="text-[#ff6b81]">Track</span>
              </p>
            </Link>

            <h1 className="font-['Poppins',sans-serif] font-bold text-[40px] text-[#1f2937] leading-tight mb-1">Create Account</h1>
            <p className="font-['Poppins',sans-serif] text-[15px] text-[#9ca3af] mb-6">Let's build your personalized health plan.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name */}
              <div>
                <p className="font-['Inter',sans-serif] font-medium text-[20px] text-black mb-2">Full Name</p>
                <div className="relative h-[54px] rounded-[14px] border border-[#e5e7eb] bg-white">
                  <input
                    type="text"
                    placeholder="Your full name"
                    required
                    value={form.name}
                    onChange={update("name")}
                    className="absolute inset-0 w-full h-full px-4 font-['Inter',sans-serif] text-[14px] text-gray-700 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <p className="font-['Inter',sans-serif] font-medium text-[20px] text-black mb-2">Email Address</p>
                <div className="relative h-[54px] rounded-[14px] border border-[#e5e7eb] bg-white">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={form.email}
                    onChange={update("email")}
                    className="absolute inset-0 w-full h-full px-4 font-['Inter',sans-serif] text-[14px] text-gray-700 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <p className="font-['Inter',sans-serif] font-medium text-[20px] text-black mb-2">Password</p>
                <div className="relative h-[54px] rounded-[14px] border border-[#e5e7eb] bg-white">
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Create a strong password"
                    required
                    value={form.password}
                    onChange={update("password")}
                    className="absolute inset-0 w-full h-full px-4 pr-12 font-['Inter',sans-serif] text-[14px] text-gray-700 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div className="h-[4px] bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.bar}`} />
                    </div>
                    <p className={`font-['Poppins',sans-serif] text-[12px] mt-1 font-semibold ${strength.text}`}>{strength.label} password</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <p className="font-['Inter',sans-serif] font-medium text-[20px] text-black mb-2">Confirm Password</p>
                <div className={`relative h-[54px] rounded-[14px] border bg-white ${mismatch ? "border-red-400" : matched ? "border-[#22c55e]" : "border-[#e5e7eb]"}`}>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="Repeat your password"
                    required
                    value={form.confirm}
                    onChange={update("confirm")}
                    className="absolute inset-0 w-full h-full px-4 font-['Inter',sans-serif] text-[14px] text-gray-700 bg-transparent focus:outline-none"
                  />
                </div>
                {mismatch && <p className="font-['Poppins',sans-serif] text-[12px] text-red-500 mt-1">Passwords don't match</p>}
                {matched && <p className="font-['Poppins',sans-serif] text-[12px] text-[#22c55e] mt-1">✓ Passwords match</p>}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <input type="checkbox" required className="mt-1 accent-[#22c55e] w-4 h-4" />
                <span className="font-['Poppins',sans-serif] text-[13px] text-gray-500">
                  I agree to the{" "}
                  <span className="text-[#22c55e] font-semibold hover:underline">Terms of Service</span>
                  {" "}and{" "}
                  <span className="text-[#22c55e] font-semibold hover:underline">Privacy Policy</span>
                </span>
              </label>

              {serverError && (
                <p className="font-['Poppins',sans-serif] text-[13px] text-red-500">{serverError}</p>
              )}

              <button
                type="submit"
                disabled={mismatch || submitting}
                className="w-full h-[54px] bg-[#22c55e] hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-['Poppins',sans-serif] font-bold text-[18px] rounded-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
              >
                {submitting ? "Creating account…" : "Create Account →"}
              </button>
            </form>

            <p className="font-['Inter',sans-serif] font-semibold text-[14px] text-[#6b7280] mt-6 text-center">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-[#22c55e] hover:underline cursor-pointer">Login</span>
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
