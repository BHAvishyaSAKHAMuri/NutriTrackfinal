import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function ResetPasswordScreen() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [, navigate] = useLocation();

  const mismatch = confirm.length > 0 && newPassword !== confirm;
  const matched = confirm.length > 0 && !mismatch;

  const strength = (() => {
    const p = newPassword;
    if (!p) return null;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { label: "Weak", bar: "w-1/4", color: "bg-red-400", text: "text-red-500" };
    if (s === 2) return { label: "Fair", bar: "w-2/4", color: "bg-yellow-400", text: "text-yellow-600" };
    if (s === 3) return { label: "Good", bar: "w-3/4", color: "bg-blue-400", text: "text-blue-600" };
    return { label: "Strong", bar: "w-full", color: "bg-[#22c55e]", text: "text-[#22c55e]" };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-8">
            <Link href="/">
              <span className="font-['Poppins',sans-serif] text-[28px] font-bold cursor-pointer">
                <span className="text-[#22c55e]">Nutri</span>
                <span className="text-[#ff6b81]">Track</span>
              </span>
            </Link>
          </div>
          <div className="bg-white rounded-[24px] shadow-[0px_10px_40px_rgba(0,0,0,0.12)] px-10 py-10 text-center">
            <div className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-[#dcfce7] mx-auto mb-6">
              <span className="text-[36px]">🎉</span>
            </div>
            <h1 className="font-['Poppins',sans-serif] font-bold text-[28px] text-[#1f2937] mb-3">
              Password Reset!
            </h1>
            <p className="font-['Poppins',sans-serif] text-[14px] text-[#6b7280] mb-8">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-[54px] bg-[#22c55e] hover:bg-green-600 text-white font-['Poppins',sans-serif] font-bold text-[16px] rounded-[14px] transition-colors cursor-pointer"
            >
              Go to Login →
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-center w-[64px] h-[64px] rounded-full bg-[#eff6ff] mx-auto mb-6">
            <span className="text-[32px]">🔒</span>
          </div>

          <h1 className="font-['Poppins',sans-serif] font-bold text-[28px] text-[#1f2937] text-center mb-2">
            Set New Password
          </h1>
          <p className="font-['Poppins',sans-serif] text-[14px] text-[#6b7280] text-center mb-8">
            Paste your reset code and choose a new password.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Reset code */}
            <div>
              <label className="block font-['Inter',sans-serif] font-medium text-[14px] text-[#374151] mb-2">
                Reset Code
              </label>
              <input
                type="text"
                placeholder="Paste your reset code here"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full h-[54px] rounded-[14px] border border-[#e5e7eb] px-4 font-mono text-[13px] text-gray-700 focus:outline-none focus:border-[#22c55e] transition-colors"
              />
            </div>

            {/* New password */}
            <div>
              <label className="block font-['Inter',sans-serif] font-medium text-[14px] text-[#374151] mb-2">
                New Password
              </label>
              <div className="relative h-[54px] rounded-[14px] border border-[#e5e7eb]">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Create a new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="absolute inset-0 w-full h-full px-4 pr-12 font-['Inter',sans-serif] text-[14px] text-gray-700 bg-transparent focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-[16px]"
                >
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="h-[4px] bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.bar}`} />
                  </div>
                  <p className={`font-['Poppins',sans-serif] text-[12px] mt-1 font-semibold ${strength.text}`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block font-['Inter',sans-serif] font-medium text-[14px] text-[#374151] mb-2">
                Confirm Password
              </label>
              <div className={`relative h-[54px] rounded-[14px] border ${mismatch ? "border-red-400" : matched ? "border-[#22c55e]" : "border-[#e5e7eb]"}`}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Repeat your new password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="absolute inset-0 w-full h-full px-4 font-['Inter',sans-serif] text-[14px] text-gray-700 bg-transparent focus:outline-none"
                />
              </div>
              {mismatch && (
                <p className="font-['Poppins',sans-serif] text-[12px] text-red-500 mt-1">Passwords don't match</p>
              )}
              {matched && (
                <p className="font-['Poppins',sans-serif] text-[12px] text-[#22c55e] mt-1">✓ Passwords match</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3">
                <p className="text-[13px] text-red-600 font-['Inter',sans-serif]">⚠️ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || mismatch || !token || !newPassword}
              className="w-full h-[54px] bg-[#22c55e] hover:bg-green-600 disabled:bg-green-300 text-white font-['Poppins',sans-serif] font-bold text-[16px] rounded-[14px] transition-colors cursor-pointer disabled:cursor-not-allowed mt-1"
            >
              {loading ? "Resetting…" : "Reset Password →"}
            </button>
          </form>

          <p className="font-['Inter',sans-serif] text-[14px] text-[#6b7280] mt-6 text-center">
            Need a new code?{" "}
            <Link href="/forgot-password">
              <span className="text-[#22c55e] font-semibold hover:underline cursor-pointer">Request again</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
