import { useState } from "react";
import { Link, useLocation } from "wouter";

type Step = "form" | "success";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>("form");
  const [username, setUsername] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      // token is returned directly (no email setup) — show it to the user
      setResetCode(data.token || "");
      setStep("success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-['Poppins',sans-serif] text-[28px] font-bold cursor-pointer">
              <span className="text-[#22c55e]">Nutri</span>
              <span className="text-[#ff6b81]">Track</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0px_10px_40px_rgba(0,0,0,0.12)] px-10 py-10">
          {step === "form" ? (
            <>
              {/* Icon */}
              <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-[#fef2f2] mx-auto mb-6">
                <span className="text-[32px]">🔑</span>
              </div>

              <h1 className="font-['Poppins',sans-serif] font-bold text-[28px] text-[#1f2937] text-center mb-2">
                Forgot Password?
              </h1>
              <p className="font-['Poppins',sans-serif] text-[14px] text-[#6b7280] text-center mb-8">
                Enter your email or username and we'll give you a reset code.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block font-['Inter',sans-serif] font-medium text-[14px] text-[#374151] mb-2">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your email or username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-[54px] rounded-[14px] border border-[#e5e7eb] px-4 font-['Inter',sans-serif] text-[14px] text-gray-700 focus:outline-none focus:border-[#22c55e] transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-red-500 font-['Inter',sans-serif]">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] bg-[#22c55e] hover:bg-green-600 disabled:bg-green-300 text-white font-['Poppins',sans-serif] font-bold text-[16px] rounded-[14px] transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? "Checking…" : "Get Reset Code"}
                </button>
              </form>

              <p className="font-['Inter',sans-serif] text-[14px] text-[#6b7280] mt-6 text-center">
                Remembered it?{" "}
                <Link href="/login">
                  <span className="text-[#22c55e] font-semibold hover:underline cursor-pointer">Back to Login</span>
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-[#dcfce7] mx-auto mb-6">
                <span className="text-[32px]">✅</span>
              </div>

              <h1 className="font-['Poppins',sans-serif] font-bold text-[26px] text-[#1f2937] text-center mb-2">
                Your Reset Code
              </h1>
              <p className="font-['Poppins',sans-serif] text-[13px] text-[#6b7280] text-center mb-6">
                Copy this code — it expires in <strong>1 hour</strong>.
              </p>

              {resetCode ? (
                <>
                  {/* Code box */}
                  <div className="bg-[#f0fdf4] border border-[#86efac] rounded-[14px] px-5 py-4 mb-4">
                    <p className="font-['Inter',sans-serif] text-[11px] text-[#16a34a] font-semibold uppercase tracking-wider mb-2">
                      Reset Code
                    </p>
                    <p className="font-mono text-[13px] text-[#1f2937] break-all select-all leading-relaxed">
                      {resetCode}
                    </p>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(resetCode)}
                    className="w-full h-[44px] border border-[#22c55e] text-[#22c55e] font-['Poppins',sans-serif] font-semibold text-[14px] rounded-[12px] hover:bg-[#f0fdf4] transition-colors cursor-pointer mb-5"
                  >
                    📋 Copy Code
                  </button>
                </>
              ) : (
                /* Username not found — same neutral message for security */
                <div className="bg-[#f0fdf4] border border-[#86efac] rounded-[14px] px-5 py-4 mb-5">
                  <p className="font-['Inter',sans-serif] text-[13px] text-[#15803d] text-center">
                    If that username exists, a reset code has been issued. Check with your admin or try the code on the reset page.
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/reset-password")}
                className="w-full h-[54px] bg-[#22c55e] hover:bg-green-600 text-white font-['Poppins',sans-serif] font-bold text-[16px] rounded-[14px] transition-colors cursor-pointer"
              >
                Set New Password →
              </button>

              <p className="font-['Inter',sans-serif] text-[14px] text-[#6b7280] mt-5 text-center">
                <Link href="/login">
                  <span className="text-[#22c55e] font-semibold hover:underline cursor-pointer">← Back to Login</span>
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
