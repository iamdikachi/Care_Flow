import React, { useState } from "react";
import { 
  Activity, 
  Lock, 
  UserCheck, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft, 
  MapPin, 
  PhoneCall, 
  ShieldCheck,
  UserPlus,
  CheckCircle,
  Briefcase,
  Mail,
  KeyRound,
  ArrowRight
} from "lucide-react";

interface PublicLoginProps {
  onLogin: () => void;
  onBackToHome: () => void;
}

type ViewMode = 'login' | 'register' | 'forgot-password' | 'otp-verify' | 'reset-password';

export default function PublicLogin({ onLogin, onBackToHome }: PublicLoginProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [regSuccess, setRegSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forgot password & reset states
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Registration state
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState<'Doctor' | 'Nurse' | 'Pharmacist' | 'Administrator' | 'Receptionist'>('Doctor');
  const [regSpecialty, setRegSpecialty] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDepartment, setRegDepartment] = useState("Emergency Department");
  const [regShift, setRegShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');

  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    // Simulate clinician auth validation
    setTimeout(() => {
      if (!email || !password) {
        setAuthError("Please provide both clinician email and security passkey.");
        setIsSubmitting(false);
        return;
      }
      onLogin();
      setIsSubmitting(false);
    }, 800);
  };

  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setRegSuccess(false);
    setIsSubmitting(true);

    if (!regName || !regEmail || !regPassword || !regDepartment) {
      setAuthError("Please fill in all required fields marked with *");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          role: regRole,
          specialty: regSpecialty || undefined,
          email: regEmail,
          phone: regPhone || "+1 (555) 000-0000",
          department: regDepartment,
          status: "On Duty",
          shift: regShift,
          image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
        })
      });

      if (res.ok) {
        setRegSuccess(true);
        setResetSuccess(false);
        setEmail(regEmail);
        setPassword(regPassword);
        setViewMode('login'); // transition back to sign-in so they can log in
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setRegSpecialty("");
        setRegPhone("");
      } else {
        const errData = await res.json();
        setAuthError(errData.error || "Failed to onboard clinician.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setAuthError("An error occurred during secure clinician registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setEmail("clinical@careflow.org");
    setPassword("demo-secure-access");
    setAuthError("");
    setIsSubmitting(true);

    setTimeout(() => {
      onLogin();
      setIsSubmitting(false);
    }, 600);
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    if (!forgotEmail) {
      setAuthError("Please provide your registered clinician email.");
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      // Simulate sending OTP to the clinician's registered email
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockOtp);
      setViewMode('otp-verify');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    if (!otpCode) {
      setAuthError("Please enter the 6-digit verification code.");
      setIsSubmitting(false);
      return;
    }

    if (otpCode !== generatedOtp && otpCode !== "000000") {
      setTimeout(() => {
        setAuthError("Invalid security verification code. Please check and try again.");
        setIsSubmitting(false);
      }, 500);
      return;
    }

    setTimeout(() => {
      setViewMode('reset-password');
      setIsSubmitting(false);
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    if (newPassword.length < 6) {
      setAuthError("Passkey must be at least 6 characters for HIPAA compliance.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setAuthError("Security passkeys do not match.");
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      // Update states to simulate passkey update
      setPassword(newPassword);
      setEmail(forgotEmail || email);
      setResetSuccess(true);
      setRegSuccess(false);
      setViewMode('login');
      setIsSubmitting(false);
      
      // Clean up temporary states
      setForgotEmail("");
      setOtpCode("");
      setNewPassword("");
      setConfirmNewPassword("");
    }, 1200);
  };

  // Helper to determine the header info based on view mode
  const getHeaderDetails = () => {
    switch (viewMode) {
      case 'register':
        return {
          icon: <UserPlus className="h-6 w-6" />,
          title: "Clinician Onboarding & Registry",
          desc: "Register your clinical credentials to obtain secure access to Portland Clinical District."
        };
      case 'forgot-password':
        return {
          icon: <Mail className="h-6 w-6" />,
          title: "Reset Security Passkey",
          desc: "Please verify your registry email address to initiate the passkey recovery procedure."
        };
      case 'otp-verify':
        return {
          icon: <ShieldCheck className="h-6 w-6" />,
          title: "Verification Code Required",
          desc: "Enter the security code dispatched to your professional clinician email node."
        };
      case 'reset-password':
        return {
          icon: <KeyRound className="h-6 w-6" />,
          title: "Choose New Security Passkey",
          desc: "Establish a secure, compliant new access passkey for your hospital account."
        };
      case 'login':
      default:
        return {
          icon: <Lock className="h-6 w-6" />,
          title: "Secure Clinician Access",
          desc: "Sign in to access EHR, bed assignments, clinical diagnostics & Copilot AI."
        };
    }
  };

  const header = getHeaderDetails();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950" id="public-login-view">
      {/* 1. PROFESSIONAL HEADER WITH BACK ROUTING */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Branding */}
          <button 
            onClick={onBackToHome}
            className="flex items-center space-x-3 text-left focus:outline-none group hover:opacity-90 transition"
          >
            <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/10">
              <Activity className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg text-white leading-tight tracking-wide flex items-center gap-1.5">
                CareFlow <span className="text-teal-400 text-xs font-mono px-1.5 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded">GEN HOSP</span>
              </h1>
              <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">Portland Clinical District</p>
            </div>
          </button>

          {/* Back Action */}
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-lg text-xs border border-slate-800 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Homepage</span>
          </button>
        </div>
      </header>

      {/* 2. ROUTED LOGIN/REGISTRATION CANVAS */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/25 via-slate-950 to-slate-950">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
          
          {/* Header branding on form */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/40 text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              {header.icon}
            </div>
            <h3 className="font-display font-extrabold text-white text-lg">
              {header.title}
            </h3>
            <p className="text-xs text-slate-500">
              {header.desc}
            </p>
          </div>

          {/* Tab Selector to toggle between Login & Registration (only show during default modes) */}
          {(viewMode === 'login' || viewMode === 'register') && (
            <div className="grid grid-cols-2 border-b border-slate-800 text-xs font-bold font-mono">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setAuthError("");
                  setRegSuccess(false);
                  setResetSuccess(false);
                }}
                className={`py-3.5 text-center transition uppercase tracking-wider border-r border-slate-800 ${
                  viewMode === 'login' 
                    ? "bg-slate-950 text-teal-400 border-b-2 border-b-teal-500" 
                    : "bg-slate-900/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                Portal Sign-In
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('register');
                  setAuthError("");
                  setRegSuccess(false);
                  setResetSuccess(false);
                }}
                className={`py-3.5 text-center transition uppercase tracking-wider ${
                  viewMode === 'register' 
                    ? "bg-slate-950 text-teal-400 border-b-2 border-b-teal-500" 
                    : "bg-slate-900/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                Registry Signup
              </button>
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Error Message */}
            {authError && (
              <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-xs text-rose-300 flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success Registration Notification Banner */}
            {regSuccess && (
              <div className="p-3 bg-teal-950/40 border border-teal-900/40 rounded-xl text-xs text-teal-300 flex items-start gap-2.5 animate-fade-in">
                <CheckCircle className="h-4.5 w-4.5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Registry Registration Successful!</p>
                  <p className="text-slate-300 mt-1">
                    Your professional staff chart has been safely filed. You may now enter the secure portal using your email below.
                  </p>
                </div>
              </div>
            )}

            {/* Success Reset Notification Banner */}
            {resetSuccess && (
              <div className="p-3 bg-teal-950/40 border border-teal-900/40 rounded-xl text-xs text-teal-300 flex items-start gap-2.5 animate-fade-in">
                <CheckCircle className="h-4.5 w-4.5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Passkey Reset Complete!</p>
                  <p className="text-slate-300 mt-1">
                    Your security passkey was successfully updated. You may now sign in using your new credentials.
                  </p>
                </div>
              </div>
            )}

            {viewMode === 'login' && (
              /* LOGIN FORM */
              <form onSubmit={handleSubmitLogin} className="space-y-4 text-left">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Clinician Registry Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="practitioner@careflow.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400">Security Passkey *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('forgot-password');
                        setAuthError("");
                        setRegSuccess(false);
                        setResetSuccess(false);
                      }}
                      className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition focus:outline-none"
                    >
                      Forgot security passkey?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-lg shadow-teal-500/15"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>{isSubmitting ? "Authenticating Clinician..." : "Access Secure EHR"}</span>
                  </button>
                </div>

                {/* Demo Quick login bypass banner */}
                <div className="pt-4 border-t border-slate-800 text-center space-y-3">
                  <p className="text-[11px] text-slate-500">Quickly test the Hospital Clinical Suite and Copilot with our default demo profile:</p>
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-teal-500/30 text-teal-400 hover:text-teal-300 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="h-4 w-4 fill-teal-500/10" />
                    <span>Single-Tap Clinician Demo Entry</span>
                  </button>
                </div>
              </form>
            )}

            {viewMode === 'register' && (
              /* REGISTRATION FORM */
              <form onSubmit={handleSubmitRegister} className="space-y-4 text-left animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Full Professional Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Arthur Pendragon, Nurse Mary Johnson"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Role Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Role Category *</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                    >
                      <option value="Doctor">Doctor</option>
                      <option value="Nurse">Nurse</option>
                      <option value="Pharmacist">Pharmacist</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Receptionist">Receptionist</option>
                    </select>
                  </div>

                  {/* Specialty area */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Specialty Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Pediatrics, Cardiology"
                      value={regSpecialty}
                      onChange={(e) => setRegSpecialty(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Professional Email Address */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Professional Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="practitioner@careflow.org"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Passkey */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Create Security Passkey / Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Create your portal entry password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Phone number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Phone / Pager Line</label>
                    <input
                      type="text"
                      placeholder="e.g. +1 (555) 019-2834"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Department Assigned */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Department Assigned *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Emergency, Pediatrics, ICU"
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Shift Assignment */}
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Shift Assignment *</label>
                    <select
                      value={regShift}
                      onChange={(e) => setRegShift(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                    >
                      <option value="Morning">Morning (06:00 - 14:00)</option>
                      <option value="Evening">Evening (14:00 - 22:00)</option>
                      <option value="Night">Night (22:00 - 06:00)</option>
                    </select>
                  </div>

                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-lg shadow-teal-500/15"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{isSubmitting ? "Onboarding Registry..." : "Create Clinician Account"}</span>
                  </button>
                </div>
              </form>
            )}

            {viewMode === 'forgot-password' && (
              /* REQUEST PASSKEY RESET FLOW */
              <form onSubmit={handleRequestOtp} className="space-y-4 text-left animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Registered Clinician Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="practitioner@careflow.org"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 transition"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    We will dispatch a secure validation code to this address if it is recognized on the registry node.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setAuthError("");
                    }}
                    className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs border border-slate-800 transition flex items-center justify-center space-x-1.5"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-lg shadow-teal-500/15"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{isSubmitting ? "Checking Registry..." : "Send Verification Code"}</span>
                  </button>
                </div>
              </form>
            )}

            {viewMode === 'otp-verify' && (
              /* OTP VERIFICATION VIEW */
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-left animate-fade-in">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Security Verification Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-center font-mono tracking-[0.5em] text-slate-200 px-3.5 py-3 rounded-xl focus:outline-none focus:border-teal-500 transition"
                  />
                  
                  {/* Demo helper badge */}
                  <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Security bypass code:</span>
                    <code className="text-teal-400 font-mono font-bold px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded select-all">
                      {generatedOtp || "000000"}
                    </code>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot-password');
                      setAuthError("");
                      setOtpCode("");
                    }}
                    className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs border border-slate-800 transition flex items-center justify-center space-x-1.5"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-lg shadow-teal-500/15"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{isSubmitting ? "Verifying..." : "Verify and Continue"}</span>
                  </button>
                </div>
              </form>
            )}

            {viewMode === 'reset-password' && (
              /* RESET SECURITY PASSKEY VIEW */
              <form onSubmit={handleResetPassword} className="space-y-4 text-left animate-fade-in">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">New Security Passkey *</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Confirm Security Passkey *</label>
                  <input
                    type="password"
                    required
                    placeholder="Verify your passkey entry"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-lg shadow-teal-500/15"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>{isSubmitting ? "Resetting passkey..." : "Confirm Passkey Reset"}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>

      {/* 3. SECURE FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-850 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-left">
          <div className="space-y-1">
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-400" />
              HIPAA Protected Security Gateway
            </h4>
            <p className="text-[11px] text-slate-500 max-w-xl">
              This registry node requires active clinical credentials. All sessions, telemetry logs, and electronic medical updates are audited daily. Unauthorized access is strictly prohibited.
            </p>
          </div>
          <div className="flex gap-4 font-mono text-[10px] text-slate-500">
            <span>EHR Node ID: C-6d63502e</span>
            <span>•</span>
            <span>Registry Status: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
