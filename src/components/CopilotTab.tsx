import React, { useState } from "react";
import { 
  Sparkles, 
  Stethoscope, 
  FileText, 
  Search, 
  Activity, 
  Copy, 
  Check, 
  AlertTriangle, 
  RotateCcw,
  BookOpen,
  Send,
  HelpCircle
} from "lucide-react";
import { Patient } from "../types";

interface CopilotTabProps {
  patients: Patient[];
}

export default function CopilotTab({ patients }: CopilotTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'symptoms' | 'soap'>('symptoms');

  // Copilot Feature 1: Clinical Symptom Analysis Helper
  const [symptomText, setSymptomText] = useState("");
  const [patientAge, setPatientAge] = useState<number | "">("");
  const [patientGender, setPatientGender] = useState<string>("Male");
  const [selectedHistory, setSelectedHistory] = useState("");
  const [symptomResult, setSymptomResult] = useState<{
    differentialDiagnoses: Array<{ condition: string; probability: string; reasoning: string }>;
    suggestedDiagnosticTests: Array<{ testName: string; rationale: string }>;
    conservativeManagement: string[];
    redFlags: string[];
  } | null>(null);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [symptomError, setSymptomError] = useState("");

  // Copilot Feature 2: SOAP Note Compiler
  const [shorthandNotes, setShorthandNotes] = useState("");
  const [soapResult, setSoapResult] = useState<{
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  } | null>(null);
  const [loadingSoap, setLoadingSoap] = useState(false);
  const [soapError, setSoapError] = useState("");

  // Copy status helper
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  // Run Symptom Analyzer
  const handleAnalyzeSymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomText) return;
    setLoadingSymptoms(true);
    setSymptomError("");
    setSymptomResult(null);

    try {
      const response = await fetch("/api/copilot/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptomText,
          patientAge: patientAge || undefined,
          patientGender,
          patientHistory: selectedHistory
        })
      });

      if (!response.ok) {
        throw new Error("Unable to fetch differential clinical evaluation from server.");
      }

      const data = await response.json();
      setSymptomResult(data);
    } catch (err: any) {
      setSymptomError(err.message || "An error occurred compiling symptom data via Gemini.");
    } finally {
      setLoadingSymptoms(false);
    }
  };

  // Run SOAP Notes Compiler
  const handleCompileSoap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shorthandNotes) return;
    setLoadingSoap(true);
    setSoapError("");
    setSoapResult(null);

    try {
      const response = await fetch("/api/copilot/soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shorthandNotes })
      });

      if (!response.ok) {
        throw new Error("Failed compiling SOAP clinical statement.");
      }

      const data = await response.json();
      setSoapResult(data);
    } catch (err: any) {
      setSoapError(err.message || "An error occurred optimizing shorthand medical notes.");
    } finally {
      setLoadingSoap(false);
    }
  };

  // Presets helper to test
  const loadSymptomPreset = (presetType: 'cardio' | 'peds' | 'derm') => {
    if (presetType === 'cardio') {
      setSymptomText("Patient complains of mild intermittent retrosternal chest pain for 3 days. Described as crushing pressure. Radiates slightly to neck, particularly on physical exertion. Associated with brief periods of diaphoresis.");
      setPatientAge(62);
      setPatientGender("Male");
      setSelectedHistory("Hyperlipidemia, 10-pack-year smoking status");
    } else if (presetType === 'peds') {
      setSymptomText("Child presenting with sudden onset of barking cough that is worse at night. Patient has mild low-grade fever (100.2 F) and coarse breathing sounds. No accessory muscle retraction noted.");
      setPatientAge(4);
      setPatientGender("Female");
      setSelectedHistory("Allergic rhinitis");
    } else if (presetType === 'derm') {
      setSymptomText("Intense itchy, dry, thickened erythematous skin patches on bilateral antecubital fossae. Worse at night. Scratch marks/excoriations present on upper limbs.");
      setPatientAge(18);
      setPatientGender("Female");
      setSelectedHistory("Family history of asthma and atopy");
    }
  };

  const loadSoapPreset = () => {
    setShorthandNotes(`pt 45y male complains 3 days severe heart burn, burning pain retrosternal, worse lying down after dinner. no radiating pain, denies shortness of breath. history of GERD. BP 128/82, HR 76. exam abdomen soft, tender epigastric region. plan - check CBC and H pylori, prescribe Esomeprazole 40mg qd, avoid caffeine/spicy foods, re-evaluate in 2w.`);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="copilot-tab-container">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-teal-400 fill-teal-500/20" />
            <h2 className="font-display font-bold text-2xl text-white">Gemini Clinical Copilot</h2>
          </div>
          <p className="text-sm text-slate-400">Advanced AI clinical decision helper for differential triage, SOAP scribing, and narrative summaries.</p>
        </div>

        {/* Tab Selector */}
        <div className="mt-4 md:mt-0 flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('symptoms')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'symptoms' 
                ? 'bg-teal-500 text-slate-950' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Symptom Triage Triage</span>
          </button>
          <button
            onClick={() => setActiveSubTab('soap')}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'soap' 
                ? 'bg-teal-500 text-slate-950' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>SOAP Note Compiler</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'symptoms' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="copilot-symptom-view">
          {/* Form input - left */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <h3 className="font-display font-semibold text-white text-base">Symptom Assessment Panel</h3>
              <div className="flex gap-1.5">
                <button 
                  type="button"
                  onClick={() => loadSymptomPreset('cardio')}
                  className="text-[9px] bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded text-teal-400 font-mono font-bold"
                >
                  Cardio
                </button>
                <button 
                  type="button"
                  onClick={() => loadSymptomPreset('peds')}
                  className="text-[9px] bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded text-teal-400 font-mono font-bold"
                >
                  Peds
                </button>
                <button 
                  type="button"
                  onClick={() => loadSymptomPreset('derm')}
                  className="text-[9px] bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded text-teal-400 font-mono font-bold"
                >
                  Derm
                </button>
              </div>
            </div>

            <form onSubmit={handleAnalyzeSymptoms} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Describe Patient Symptoms *</label>
                <textarea
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  rows={4}
                  required
                  placeholder="e.g. Sharp substernal chest discomfort worsening with coughing or deep inhalation. Relieved by leaning forward. No radiating pain..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-3 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Patient Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 45"
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Patient Biological Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Co-existing Critical Medical History</label>
                <input
                  type="text"
                  value={selectedHistory}
                  onChange={(e) => setSelectedHistory(e.target.value)}
                  placeholder="e.g. Asthma, Hyperlipidemia, Type 2 Diabetes"
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loadingSymptoms}
                  className="py-2.5 px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{loadingSymptoms ? "Triage in progress..." : "Conduct Evaluation"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form Result - right */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl lg:col-span-7 min-h-[400px]">
            {loadingSymptoms && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3.5 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Activity className="h-5 w-5 animate-spin" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-slate-200">Analyzing Clinical Symptoms</p>
                  <p className="text-xs text-slate-500 max-w-sm">Generating medical differentials, diagnostic suggestions, and immediate red flags using Gemini clinical protocols.</p>
                </div>
              </div>
            )}

            {symptomError && (
              <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-xl text-xs text-rose-300">
                {symptomError}
              </div>
            )}

            {!loadingSymptoms && !symptomError && !symptomResult && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-500 space-y-3">
                <HelpCircle className="h-12 w-12 text-slate-700 stroke-[1.5]" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-300">Awaiting Clinical Intake</p>
                  <p className="text-xs text-slate-600 max-w-sm">Enter symptom descriptions or load presets on the left, then click Evaluate to receive expert clinician support recommendations.</p>
                </div>
              </div>
            )}

            {symptomResult && (
              <div className="space-y-5 animate-fade-in text-xs text-slate-300 leading-relaxed font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-semibold text-white">Clinical Assessment Findings</h4>
                  <button 
                    onClick={() => handleCopyText(JSON.stringify(symptomResult, null, 2), "symptom-results")}
                    className="flex items-center space-x-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedSection === "symptom-results" ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSection === "symptom-results" ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>

                {/* Differentials */}
                <div className="space-y-2.5">
                  <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Potential Differentials Diagnoses</p>
                  <div className="grid grid-cols-1 gap-2">
                    {symptomResult.differentialDiagnoses.map((diff, i) => (
                      <div key={i} className="bg-slate-950 border border-slate-850 p-3 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-100 text-xs">{diff.condition}</strong>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                            diff.probability === 'High' 
                              ? 'bg-rose-950/40 text-rose-300 border-rose-900/60' 
                              : diff.probability === 'Medium' 
                                ? 'bg-amber-950/40 text-amber-300 border-amber-900/60'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}>
                            {diff.probability} Probability
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{diff.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Suggested Diagnostics */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Suggested Diagnostics Workup</p>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {symptomResult.suggestedDiagnosticTests.map((test, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-950 border border-slate-850 rounded">
                          <p className="font-bold text-slate-200 text-xs">{test.testName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{test.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conservative Management */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Conservative Treatment Recommendations</p>
                    <ul className="list-disc list-inside bg-slate-950 border border-slate-850 p-3 rounded-lg space-y-1.5 text-slate-300 text-[11px]">
                      {symptomResult.conservativeManagement.map((itm, idx) => (
                        <li key={idx} className="leading-snug">{itm}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Red Flags warnings */}
                {symptomResult.redFlags && symptomResult.redFlags.length > 0 && (
                  <div className="p-3 bg-red-950/30 border border-red-900/60 text-red-200 rounded-lg space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Critical Red Flag Warnings (Urgent ER/Triage Referral)
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                      {symptomResult.redFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-center pt-2">
                  <p className="text-[9px] text-slate-500 font-mono">
                    Disclaimer: CareFlow Clinical Copilot is an AI decision support helper and must be validated by the attending clinical practitioner.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="copilot-soap-view">
          {/* Form input - left */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
              <h3 className="font-display font-semibold text-white text-base">SOAP Notes Formulator</h3>
              <button
                type="button"
                onClick={loadSoapPreset}
                className="text-[10px] text-teal-400 hover:text-teal-300 font-mono font-bold flex items-center gap-1"
              >
                Load Shorthand Demo
              </button>
            </div>

            <form onSubmit={handleCompileSoap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Enter Doctor's Shorthand / Bullets *</label>
                <textarea
                  value={shorthandNotes}
                  onChange={(e) => setShorthandNotes(e.target.value)}
                  rows={8}
                  required
                  placeholder="e.g. pt complaints 3d dry barking cough, worse at night. mild fever, 100.4 F, resp normal. exam no retraction, clear breath sounds. plan order spirometry to rule out asthma, prescribe honey syrup..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 p-3 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loadingSoap}
                  className="py-2.5 px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-sm transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{loadingSoap ? "Compiling..." : "Formulate SOAP"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form Result - right */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl lg:col-span-7 min-h-[400px]">
            {loadingSoap && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3.5 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <FileText className="h-5 w-5 animate-spin" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-slate-200">Compiling SOAP Format</p>
                  <p className="text-xs text-slate-500 max-w-sm">Generating clean, standard SOAP clinical structure (Subjective, Objective, Assessment, Plan) with clinical terminology.</p>
                </div>
              </div>
            )}

            {soapError && (
              <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded-xl text-xs text-rose-300">
                {soapError}
              </div>
            )}

            {!loadingSoap && !soapError && !soapResult && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-500 space-y-3">
                <BookOpen className="h-12 w-12 text-slate-700 stroke-[1.5]" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-300">Awaiting Medical Shorthand</p>
                  <p className="text-xs text-slate-600 max-w-sm">Type in your raw, rapid consult bullet points on the left to see them instantly expanded into structured SOAP notes.</p>
                </div>
              </div>
            )}

            {soapResult && (
              <div className="space-y-4 animate-fade-in text-xs text-slate-300 font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-semibold text-white">Structured SOAP Medical Statement</h4>
                  <button 
                    onClick={() => handleCopyText(`[SUBJECTIVE]\n${soapResult.subjective}\n\n[OBJECTIVE]\n${soapResult.objective}\n\n[ASSESSMENT]\n${soapResult.assessment}\n\n[PLAN]\n${soapResult.plan}`, "soap-results")}
                    className="flex items-center space-x-1.5 text-slate-400 hover:text-white"
                  >
                    {copiedSection === "soap-results" ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSection === "soap-results" ? "Copied Note" : "Copy Statement"}</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                  {/* Subjective */}
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                    <p className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-wider">S - Subjective complaints</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{soapResult.subjective}</p>
                  </div>

                  {/* Objective */}
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                    <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider">O - Objective Examination / Vitals</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{soapResult.objective}</p>
                  </div>

                  {/* Assessment */}
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                    <p className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider">A - Clinical Assessment & Diagnosis</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{soapResult.assessment}</p>
                  </div>

                  {/* Plan */}
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-1">
                    <p className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">P - Treatment & Follow-up Plan</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{soapResult.plan}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-[10px] text-slate-500 font-mono leading-normal">
                  Attending clinical review recommended prior to printing or pushing to permanent patient charts.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
