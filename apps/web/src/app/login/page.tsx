"use client";

// import React, { useState } from "react";
// import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     // Handle login logic
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-[#2c2115]/10 p-4">
//       <div className="relative w-full max-w-md rounded-3xl border border-[#2c2115]/15 bg-[#fffdf7] p-7 shadow-2xl">
//         <div>
//           <h2 className="font-display text-2xl font-medium text-[#2c2115]">
//             Welcome back
//           </h2>
//           <p className="mt-1 text-sm text-[#8a7a63]">
//             Please enter your details to sign in
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="mt-6 space-y-5">
//           {/* Email Input */}
//           <div>
//             <label
//               htmlFor="email"
//               className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
//             >
//               Email address
//             </label>

//             <div className="relative mt-2">
//               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a7a63]">
//                 <Mail className="h-4 w-4" />
//               </span>

//               <input
//                 id="email"
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="name@example.com"
//                 className="w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] py-3 pl-10 pr-4 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
//               />
//             </div>
//           </div>

//           {/* Password Input */}
//           <div>
//             <div className="flex items-center justify-between">
//               <label
//                 htmlFor="password"
//                 className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
//               >
//                 Password
//               </label>
//               <a
//                 href="#forgot-password"
//                 className="text-xs font-semibold text-[#c96f4a] transition hover:underline"
//               >
//                 Forgot?
//               </a>
//             </div>

//             <div className="relative mt-2">
//               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a7a63]">
//                 <Lock className="h-4 w-4" />
//               </span>

//               <input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 required
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 className="w-full rounded-xl border border-[#2c2115]/20 bg-[#faf5ec] py-3 pl-10 pr-11 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25"
//               />

//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7a63] transition hover:text-[#2c2115]"
//               >
//                 {showPassword ? (
//                   <EyeOff className="h-4 w-4" />
//                 ) : (
//                   <Eye className="h-4 w-4" />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="pt-1">
//             <button
//               type="submit"
//               className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2c2115] px-4 py-3 text-sm font-semibold text-[#faf5ec] transition hover:bg-[#c96f4a]"
//             >
//               <span>Sign in</span>
//               <ArrowRight className="h-4 w-4" />
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Wallet,
  AlertCircle,
  KeyRound,
  Check,
  X,
} from "lucide-react";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    agreeTerms: false,
  });

  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear field error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const showNotification = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "Too weak", color: "bg-stone-300" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-amber-600" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 75, label: "Good", color: "bg-emerald-500" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-emerald-600" };
      default:
        return { score: 10, label: "Too short", color: "bg-red-400" };
    }
  };

  const strength = calculatePasswordStrength(formData.password);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Invalid email address";

    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6)
      errors.password = "Must be at least 6 characters";

    if (authMode === "register") {
      if (!formData.name.trim()) errors.name = "Full name is required";
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
      if (!formData.agreeTerms) {
        errors.agreeTerms = "You must accept terms to create an account";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      if (authMode === "register") {
        showNotification(
          `Welcome aboard, ${formData.name}! Your budget profile is ready.`,
        );
      } else {
        console.log({
          email: formData.email,
          password: formData.password,
          submittedAt: new Date().toISOString(),
        });
        console.log("data", formData);
        showNotification(
          `Welcome back! Successfully authenticated as ${formData.email}.`,
        );
      }
    }, 1200);
  };

  const handleSocialLogin = (provider: string) => {
    showNotification(`Initiating secure login via ${provider}...`);
  };

  return (
    <div className="min-h-screen w-full bg-[#faf5ec] flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 font-sans text-[#2c2115] selection:bg-[#c96f4a]/20 selection:text-[#c96f4a] relative overflow-x-hidden">
      {/* Background Subtle Gradient Glows */}
      {}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-[#c96f4a]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#2c2115]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-[45%] left-[60%] w-[320px] h-[320px] rounded-full bg-[#8a7a63]/10 blur-3xl pointer-events-none" />

      {/* Header Bar */}
      {}
      <header className="w-full max-w-md flex justify-between items-center z-10 pt-2 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-[#2c2115] text-[#faf5ec] flex items-center justify-center shadow-md">
            <Wallet className="w-5 h-5 text-[#c96f4a]" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold text-[#2c2115] tracking-tight block leading-none">
              Aura
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#8a7a63]">
              Finances
            </span>
          </div>
        </div>

        <div className="rounded-full border border-[#2c2115]/15 bg-[#fffdf7] px-3.5 py-1.5 text-xs font-semibold text-[#8a7a63] shadow-sm flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Encrypted Auth
        </div>
      </header>

      {/* Main Authentication Card */}
      {}
      <main className="relative z-10 w-full max-w-md my-auto py-2">
        <div className="relative w-full rounded-3xl border border-[#2c2115]/15 bg-[#fffdf7] p-7 sm:p-9 shadow-2xl transition-all duration-300">
          {/* Top Title Banner */}
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#c96f4a]" />
              {authMode === "register"
                ? "Start your journey"
                : "Personal Dashboard"}
            </div>
            <h1 className="font-serif text-3xl font-medium text-[#2c2115] tracking-tight">
              {authMode === "register" ? "Create account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-sm text-[#8a7a63] leading-relaxed">
              {authMode === "register"
                ? "Set up your financial profile and manage budgets effortlessly."
                : "Sign in to track spending, set budgets, and review savings."}
            </p>
          </div>

          {/* Tab Navigation Switcher */}
          <div className="mt-6 p-1 rounded-2xl border border-[#2c2115]/10 bg-[#faf5ec] grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setFormErrors({});
              }}
              className={`py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                authMode === "login"
                  ? "bg-[#fffdf7] text-[#2c2115] shadow-sm border border-[#2c2115]/10"
                  : "text-[#8a7a63] hover:text-[#2c2115]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setFormErrors({});
              }}
              className={`py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                authMode === "register"
                  ? "bg-[#fffdf7] text-[#2c2115] shadow-sm border border-[#2c2115]/10"
                  : "text-[#8a7a63] hover:text-[#2c2115]"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Content */}
          {}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* REGISTER ONLY: Full Name Field */}
            {authMode === "register" && (
              <div className="animate-fadeIn">
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
                >
                  Full Name
                </label>
                <div className="relative mt-1.5">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a63]" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Eleanor Vance"
                    className={`w-full rounded-xl border ${
                      formErrors.name ? "border-red-500" : "border-[#2c2115]/20"
                    } bg-[#faf5ec] py-3 pl-10 pr-4 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25`}
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
              >
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a63]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="eleanor@example.com"
                  className={`w-full rounded-xl border ${
                    formErrors.email ? "border-red-500" : "border-[#2c2115]/20"
                  } bg-[#faf5ec] py-3 pl-10 pr-4 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25`}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
                >
                  Password
                </label>
                {authMode === "login" && (
                  <button
                    type="button"
                    onClick={() =>
                      showNotification(
                        "Password reset instructions sent to your email!",
                      )
                    }
                    className="text-xs text-[#8a7a63] hover:text-[#c96f4a] transition hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a63]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••••••"
                  className={`w-full rounded-xl border ${
                    formErrors.password
                      ? "border-red-500"
                      : "border-[#2c2115]/20"
                  } bg-[#faf5ec] py-3 pl-10 pr-11 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a7a63] hover:text-[#2c2115] transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.password}
                </p>
              )}

              {/* REGISTER ONLY: Password Strength Meter */}
              {}
              {authMode === "register" && formData.password && (
                <div className="mt-2.5 p-2.5 rounded-xl border border-[#2c2115]/10 bg-[#faf5ec]">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-[#8a7a63] font-medium">
                      Strength:
                    </span>
                    <span className="font-semibold text-[#2c2115]">
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#2c2115]/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* REGISTER ONLY: Confirm Password Field */}
            {authMode === "register" && (
              <div className="animate-fadeIn">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#8a7a63]"
                >
                  Confirm Password
                </label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7a63]" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••••••"
                    className={`w-full rounded-xl border ${
                      formErrors.confirmPassword
                        ? "border-red-500"
                        : "border-[#2c2115]/20"
                    } bg-[#faf5ec] py-3 pl-10 pr-11 text-sm text-[#2c2115] outline-none transition placeholder:text-[#8a7a63]/60 focus:border-[#c96f4a] focus:ring-2 focus:ring-[#c96f4a]/25`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a7a63] hover:text-[#2c2115] transition"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{" "}
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me / Terms & Conditions Checkbox */}
            {}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    name={authMode === "register" ? "agreeTerms" : "rememberMe"}
                    checked={
                      authMode === "register"
                        ? formData.agreeTerms
                        : formData.rememberMe
                    }
                    onChange={handleInputChange}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded border border-[#2c2115]/30 bg-[#faf5ec] peer-checked:bg-[#2c2115] peer-checked:border-[#2c2115] transition-all flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#faf5ec] opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs text-[#8a7a63] leading-snug group-hover:text-[#2c2115] transition">
                  {authMode === "register" ? (
                    <>
                      I agree to the{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          showNotification("Terms of Service opened");
                        }}
                        className="underline font-semibold text-[#2c2115] hover:text-[#c96f4a]"
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          showNotification("Privacy Policy opened");
                        }}
                        className="underline font-semibold text-[#2c2115] hover:text-[#c96f4a]"
                      >
                        Privacy Policy
                      </a>
                    </>
                  ) : (
                    "Keep me signed in for 30 days"
                  )}
                </span>
              </label>
              {authMode === "register" && formErrors.agreeTerms && (
                <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {formErrors.agreeTerms}
                </p>
              )}
            </div>

            {/* Main Action Button */}
            {}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden rounded-full bg-[#2c2115] px-6 py-3 text-sm font-semibold text-[#faf5ec] transition duration-200 hover:bg-[#c96f4a] active:scale-[0.99] disabled:opacity-75 shadow-md flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#faf5ec]/30 border-t-[#faf5ec] rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {authMode === "register"
                        ? "Create Free Account"
                        : "Sign In to Dashboard"}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Social Auth Divider */}
          {}
          <div className="relative mt-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2c2115]/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#fffdf7] px-3 text-[#8a7a63] uppercase tracking-[0.15em] text-[10px] font-semibold">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="flex items-center justify-center gap-2 rounded-full border border-[#2c2115]/20 px-4 py-2.5 text-xs font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("Apple")}
              className="flex items-center justify-center gap-2 rounded-full border border-[#2c2115]/20 px-4 py-2.5 text-xs font-semibold text-[#2c2115] transition hover:bg-[#2c2115]/5 active:scale-[0.98]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.07-3.27-2.62-7.23-7.3-11.89-14.05-7.85-11.41-14.12-24.18-18.82-38.32-4.7-14.13-7.05-27.4-7.05-39.81 0-15.58 3.82-28.82 11.46-39.73 7.64-10.91 17.5-16.48 29.58-16.71 4.58 0 9.71 1.2 15.39 3.6 5.68 2.4 9.61 3.69 11.78 3.88 2.07-.19 6.1-1.54 12.09-4.05 5.99-2.51 10.96-3.65 14.92-3.42 10.47.65 19.33 4.41 26.58 11.28-9.82 5.99-14.61 14.28-14.38 24.86.23 10.36 4.31 18.81 12.24 25.35 4.36 3.6 9.38 6.09 15.06 7.47-2.3 6.76-5.23 13.52-8.79 20.28zM119.22 31.84c0-7.3 2.62-14.34 7.86-21.13 5.24-6.79 11.89-10.71 19.95-11.76.22 1.09.33 2.07.33 2.94 0 7.19-2.73 14.34-8.18 21.45-5.45 7.11-12.16 11.02-20.13 11.73-.22-1.09-.33-2.18-.33-3.23z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Security Subcard Footnote */}
          {}
          <div className="mt-7 rounded-2xl border border-[#2c2115]/10 bg-[#faf5ec] p-4 text-xs text-[#8a7a63]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#2c2115] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c96f4a]" />{" "}
                Enterprise Grade Security
              </span>
              <span className="text-[11px] font-mono text-[#2c2115]/70">
                AES-256
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed">
              Your budget parameters and personal credentials are encrypted
              using end-to-end security protocols.
            </p>
          </div>
        </div>
      </main>

      {/* Toast Notification Floating Banner */}
      {}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 rounded-full border border-[#2c2115]/20 bg-[#2c2115] px-5 py-3 text-xs font-medium text-[#faf5ec] shadow-2xl">
            <CheckCircle2 className="w-4 h-4 text-[#c96f4a]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-3 z-10">
        <p className="text-xs text-[#8a7a63]">
          &copy; {new Date().getFullYear()} Aura Finance Systems Inc. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
