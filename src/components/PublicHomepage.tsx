import React, { useState } from "react";
import { 
  Activity, 
  Stethoscope, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  PhoneCall, 
  HeartHandshake, 
  AlertCircle,
  MapPin,
  Lock,
  ChevronRight,
  Plus
} from "lucide-react";
import { Doctor } from "../types";

interface PublicHomepageProps {
  doctors: Doctor[];
  onNavigateToLogin: () => void;
}

export default function PublicHomepage({ doctors, onNavigateToLogin }: PublicHomepageProps) {
  const activeDoctorsCount = doctors.filter(d => d.status === "On Duty" || d.status === "On Call").length;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950" id="public-homepage">
      {/* 1. PROFESSIONAL HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Branding */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/10">
              <Activity className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg text-white leading-tight tracking-wide flex items-center gap-1.5">
                CareFlow <span className="text-teal-400 text-xs font-mono px-1.5 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded">GEN HOSP</span>
              </h1>
              <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">Portland Clinical District</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <button 
              onClick={() => scrollToSection("about")} 
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection("specialists")} 
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Specialists
            </button>
            <button 
              onClick={() => scrollToSection("status-board")} 
              className="hover:text-teal-400 transition cursor-pointer flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Live Status
            </button>
            <button 
              onClick={() => scrollToSection("copilot-info")} 
              className="hover:text-teal-400 transition cursor-pointer text-teal-400"
            >
              AI Copilot
            </button>
          </nav>

          {/* Action Call */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onNavigateToLogin}
              className="hidden sm:inline-flex items-center space-x-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold rounded-lg text-xs border border-slate-800 transition"
            >
              <span>Clinician Portal</span>
            </button>
            <button
              onClick={onNavigateToLogin}
              className="py-2 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-lg shadow-teal-500/15"
            >
              Access EHR Suite
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="flex-grow">
        
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24 border-b border-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-slate-950 to-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Mission Description */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800/80 px-3 py-1 rounded-full text-xs text-teal-400 font-mono font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping"></span>
                  <span>Fully Operational Digital EHR Suite</span>
                </div>
                
                <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
                  Streamlined Clinician Workflow, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-300">
                    AI-Driven Diagnostics.
                  </span>
                </h2>

                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                  CareFlow General Hospital brings together leading medical specialists, state-of-the-art ward occupancy management, and real-time electronic health records (EHR) enhanced by the Gemini Clinical Copilot.
                </p>

                {/* Quick Stats Panel */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                  <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-xl">
                    <p className="text-xs font-mono text-slate-500 uppercase">Emergency Service</p>
                    <p className="text-lg font-bold text-teal-400 mt-1">24 Hours / 7 Days</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-xl">
                    <p className="text-xs font-mono text-slate-500 uppercase">Active Practitioners</p>
                    <p className="text-lg font-bold text-white mt-1">{doctors.length || 8} Registered</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-900 p-4 rounded-xl col-span-2 sm:col-span-1">
                    <p className="text-xs font-mono text-slate-500 uppercase">Average ER Wait</p>
                    <p className="text-lg font-bold text-teal-400 mt-1 flex items-center gap-1.5">
                      <Clock className="h-4.5 w-4.5 text-teal-400" />
                      8 Mins
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={onNavigateToLogin}
                    className="flex items-center justify-center space-x-2 py-3 px-6 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/10"
                  >
                    <span>Clinician Sign-In Gateway</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollToSection("about")}
                    className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition"
                  >
                    Explore Clinical Facilities
                  </button>
                </div>
              </div>

              {/* Right Column: Real-time Clinic Live Status Board */}
              <div className="lg:col-span-5" id="status-board">
                <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl shadow-2xl relative space-y-4">
                  <div className="absolute top-4 right-4 flex items-center space-x-1 bg-emerald-950/60 border border-emerald-900/50 px-2 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">Active</span>
                  </div>

                  <div className="space-y-1 text-left">
                    <h3 className="font-display font-semibold text-white text-sm">Clinical District Dashboard</h3>
                    <p className="text-xs text-slate-500">Live operational statistics synced from hospital systems.</p>
                  </div>

                  <div className="divide-y divide-slate-800/60">
                    <div className="py-3 flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        Outpatient Clinic Status
                      </span>
                      <span className="font-mono font-bold text-emerald-400 uppercase">Accepting Patients</span>
                    </div>

                    <div className="py-3 flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-slate-500" />
                        Attending Clinicians On-Duty
                      </span>
                      <span className="font-mono font-bold text-white">{activeDoctorsCount || 4} Physicians</span>
                    </div>

                    <div className="py-3 flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-2">
                        <PhoneCall className="h-4 w-4 text-slate-500" />
                        Emergency Desk Dispatch
                      </span>
                      <span className="font-mono font-bold text-teal-400">1-800-CAREFLOW</span>
                    </div>

                    <div className="py-3 flex justify-between items-center text-xs">
                      <span className="text-slate-400 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-slate-500" />
                        HIPAA Informatics Privacy
                      </span>
                      <span className="font-mono text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                        Level-3 SSL Encrypted
                      </span>
                    </div>
                  </div>

                  {/* Quick Patient Triage Alert */}
                  <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl flex gap-3 text-left">
                    <Sparkles className="h-4.5 w-4.5 text-teal-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-mono font-bold text-teal-400 uppercase">Triage Technology Included</p>
                      <p className="text-[11px] text-slate-300 leading-normal">
                        Gemini Clinical Copilot automates differential summaries and SOAP note compiling directly within the secure EHR workspace.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CLINICAL FACILITIES & SERVICES SECTION */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-900" id="about">
          <div className="text-center space-y-2 max-w-xl mx-auto mb-12">
            <p className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest">Medical Services Catalog</p>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Full-Spectrum Hospital Operations</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore our core medical departments and hospital administrative platforms operated securely behind our practitioner portal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Service 1 */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl text-left space-y-3 hover:border-slate-800 transition">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Building2 className="h-5 w-5" />
              </div>
              <h4 className="font-display font-bold text-base text-white">Inpatient Ward Allocation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated bed trackers for ICU, Pediatric, and General wards. Monitor occupancy rates, clean-cycles, and patient assignment vectors instantly.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl text-left space-y-3 hover:border-slate-800 transition">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h4 className="font-display font-bold text-base text-white">Interactive Medical EHR</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive patient databases featuring electronic health chart enrollments, vital statistics tracking, active clinical prescriptions, and history logs.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl text-left space-y-3 hover:border-slate-800 transition">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Clock className="h-5 w-5" />
              </div>
              <h4 className="font-display font-bold text-base text-white">Interactive Scribing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Schedule consultations and allocate doctors safely. Manage active, complete, or canceled check-ups with zero timing collisions.
              </p>
            </div>

            {/* Service 4 */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl text-left space-y-3 hover:border-slate-800 transition">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="font-display font-bold text-base text-white">Clinical AI Copilot</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                State-of-the-art diagnostic recommendations based on symptom logs and immediate generation of standardized SOAP medical reports using Gemini models.
              </p>
            </div>

            {/* Service 5 */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl text-left space-y-3 hover:border-slate-800 transition">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-display font-bold text-base text-white">Computerized Ledger Billing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate medical invoices, adjust insurance deductibles, register itemized surgical or ward costs, and preview professional printable statements.
              </p>
            </div>

            {/* Service 6 */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl text-left space-y-3 hover:border-slate-800 transition">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h4 className="font-display font-bold text-base text-white">Integrated Care Coordination</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empower clinicians with immediate communication rails, active specialist rosters, status duty switches, and instant patient charts lookup.
              </p>
            </div>

          </div>
        </section>

        {/* SPECIALIST ROSTER DISPLAY */}
        <section className="py-16 bg-slate-950 border-b border-slate-900" id="specialists">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 text-left">
              <div className="space-y-1 max-w-xl">
                <p className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest">Medical Staff</p>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Consulting Specialists Directory</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  CareFlow features leading medical specialists registered and available for emergency allocations or custom diagnostics.
                </p>
              </div>
              <button
                onClick={onNavigateToLogin}
                className="mt-4 md:mt-0 inline-flex items-center space-x-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold uppercase tracking-wider"
              >
                <span>View Full Clinical Schedule</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Specialist Profiles Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {doctors.slice(0, 4).map((doc) => (
                <div key={doc.id} className="bg-slate-900 border border-slate-850 rounded-xl p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className={`text-[9px] font-mono font-semibold uppercase px-2 py-0.5 border rounded ${
                      doc.status === "On Duty" 
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/40"
                        : "bg-amber-950/40 text-amber-400 border-amber-900/40"
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <div className="h-10 w-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-teal-400">
                    <Stethoscope className="h-5 w-5" />
                  </div>

                  <div className="space-y-0.5">
                    <h5 className="font-display font-bold text-slate-200 text-sm">{doc.name}</h5>
                    <p className="text-xs text-teal-400 font-medium">{doc.specialty}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Registry: {doc.id}</p>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    Consulting specialist at Portland Clinical District. Accepting appointments during outpatient hours.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI COPILOT INFO CALLOUT */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-900" id="copilot-info">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-10 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 bg-gradient-to-l from-teal-500/10 to-transparent w-full h-full pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center space-x-1.5 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded text-[10px] text-teal-400 font-mono font-bold uppercase">
                  <Sparkles className="h-3 w-3 fill-teal-500/20" />
                  <span>Clinical Intelligence Suite</span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Empowered by Gemini AI Reasoning Models</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                  Reduce administrative fatigue and improve triaging precision. Our secure medical workspace provides full access to differential diagnostics generators, treatment rationales, and structured SOAP medical expands powered by enterprise-tier LLM intelligence.
                </p>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-teal-400 rounded-full"></span>
                    Symptom Triage Analysis
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-teal-400 rounded-full"></span>
                    SOAP Clinician Expander
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-teal-400 rounded-full"></span>
                    Instant PDF Medical Ledger Generation
                  </span>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <button
                  onClick={onNavigateToLogin}
                  className="w-full lg:w-auto flex items-center justify-center space-x-2 py-3 px-6 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/10"
                >
                  <span>Evaluate AI Triage Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 4. PROFESSIONAL LANDING FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-850 py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
          
          {/* Column 1: Hospital details */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center shadow">
                <Activity className="h-5 w-5 text-slate-950 stroke-[2]" />
              </div>
              <h4 className="font-display font-bold text-white text-sm">CAREFLOW CLINICAL CORP</h4>
            </div>
            <p className="leading-relaxed text-slate-500 text-[11px] max-w-sm">
              CareFlow General Clinical Hospital is a fully integrated healthcare delivery network powering advanced digital health informatics, ward operations, and electronic diagnostic services.
            </p>
            <div className="space-y-1 text-slate-500 font-mono text-[10px]">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-600" />
                100 Careflow Blvd, Medical District, Portland, OR 97201
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="h-3.5 w-3.5 text-slate-600" />
                Emergency Line: +1 (503) 555-0199
              </p>
            </div>
          </div>

          {/* Column 2: Working Hours */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider">Clinical Hours</h5>
            <ul className="space-y-2 text-slate-500 text-[11px]">
              <li className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Emergency Services</span>
                <span className="font-mono text-teal-400">24 Hours / 7 Days</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Outpatient Consultations</span>
                <span className="font-mono text-slate-300">7:00 AM – 9:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-slate-800/60 pb-1">
                <span>Specialized Surgeries</span>
                <span className="font-mono text-slate-300">Scheduled Daily</span>
              </li>
              <li className="flex justify-between">
                <span>Central Pharmacy</span>
                <span className="font-mono text-slate-300">8:00 AM – 11:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Disclaimers */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="font-display font-bold text-white text-xs uppercase tracking-wider">Regulatory Compliance</h5>
            <p className="text-slate-500 leading-normal text-[11px]">
              This workspace software operates in fully authenticated, HIPAA compliant clinical district network modes. Patient charts, bed vectors, and billing ledgers must be validated with the respective hospital registrar prior to clinical discharge.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[10px] font-mono bg-slate-950 border border-slate-800/80 text-slate-500 px-3 py-1 rounded">
                EHR Registry ID: C-6d63502e
              </span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-600">
          <p>© 2026 CareFlow General Hospital. All medical registries and informatics suites reserved.</p>
          <div className="flex space-x-6">
            <button onClick={onNavigateToLogin} className="hover:text-slate-400 transition">Practitioner Agreement</button>
            <button onClick={onNavigateToLogin} className="hover:text-slate-400 transition">Informatics Privacy Policy</button>
            <button onClick={onNavigateToLogin} className="hover:text-slate-400 transition">Secure Gateway Audit</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
