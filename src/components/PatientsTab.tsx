import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Heart, 
  Eye, 
  AlertTriangle, 
  Pill, 
  History, 
  ChevronRight, 
  Activity,
  Contact,
  X,
  UserPlus,
  Sparkles,
  ClipboardList,
  UserCheck,
  CheckCircle,
  FileText
} from "lucide-react";
import { Patient, Medication, VisitHistory } from "../types";

interface PatientsTabProps {
  patients: Patient[];
  onAddPatient: (newPatient: Omit<Patient, "id">) => void;
  onUpdatePatient: (id: string, updates: Partial<Patient>) => void;
  onDeletePatient: (id: string) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

export default function PatientsTab({
  patients,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  selectedPatientId,
  setSelectedPatientId
}: PatientsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [bloodFilter, setBloodFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New patient state inputs
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState<number>(35);
  const [newPatientGender, setNewPatientGender] = useState<'Male' | 'Female' | 'Other'>("Male");
  const [newPatientBlood, setNewPatientBlood] = useState("O+");
  const [newPatientPhone, setNewPatientPhone] = useState("");
  const [newPatientEmail, setNewPatientEmail] = useState("");
  const [newPatientEmergency, setNewPatientEmergency] = useState("");
  const [newDiagnosesStr, setNewDiagnosesStr] = useState("");
  const [newAllergiesStr, setNewAllergiesStr] = useState("");

  // Quick visit history append state
  const [newHistoryType, setNewHistoryType] = useState("Consultation");
  const [newHistoryNotes, setNewHistoryNotes] = useState("");
  const [newHistoryDoctor, setNewHistoryDoctor] = useState("Dr. James O'Connor");

  // Medication add item state
  const [medsList, setMedsList] = useState<Medication[]>([]);
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medFreq, setMedFreq] = useState("");

  // AI Patient Summary cache
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    keyConcerns: string[];
    recommendedActions: string[];
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState("");

  // Filter and search
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.diagnoses.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = genderFilter ? p.gender === genderFilter : true;
    const matchesBlood = bloodFilter ? p.bloodType === bloodFilter : true;
    return matchesSearch && matchesGender && matchesBlood;
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleAddMed = () => {
    if (!medName || !medDosage) return;
    setMedsList([...medsList, { name: medName, dosage: medDosage, frequency: medFreq }]);
    setMedName("");
    setMedDosage("");
    setMedFreq("");
  };

  const handleRemoveMed = (index: number) => {
    setMedsList(medsList.filter((_, i) => i !== index));
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName) return;

    const diagnoses = newDiagnosesStr.split(",").map(d => d.trim()).filter(Boolean);
    const allergies = newAllergiesStr.split(",").map(a => a.trim()).filter(Boolean);

    onAddPatient({
      name: newPatientName,
      age: Number(newPatientAge),
      gender: newPatientGender,
      bloodType: newPatientBlood,
      phone: newPatientPhone,
      email: newPatientEmail,
      emergencyContact: newPatientEmergency,
      diagnoses,
      allergies,
      medications: medsList,
      history: [
        {
          date: new Date().toISOString().split("T")[0],
          type: "Initial Intake",
          notes: "Registered in the electronic hospital system. Baseline records compiled.",
          doctorName: "Registrar Nurse"
        }
      ]
    });

    // Reset fields
    setNewPatientName("");
    setNewPatientAge(35);
    setNewPatientGender("Male");
    setNewPatientBlood("O+");
    setNewPatientPhone("");
    setNewPatientEmail("");
    setNewPatientEmergency("");
    setNewDiagnosesStr("");
    setNewAllergiesStr("");
    setMedsList([]);
    setShowAddForm(false);
  };

  // Add new clinical history visit note to current patient
  const handleAppendHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newHistoryNotes) return;

    const newVisit: VisitHistory = {
      date: new Date().toISOString().split("T")[0],
      type: newHistoryType,
      notes: newHistoryNotes,
      doctorName: newHistoryDoctor
    };

    const updatedHistory = [newVisit, ...(selectedPatient.history || [])];
    onUpdatePatient(selectedPatient.id, { history: updatedHistory });
    setNewHistoryNotes("");
    setAiSummary(null); // invalidate cached summary
  };

  // Trigger Gemini Clinical Medical History Summarizer
  const generateAiSummary = async () => {
    if (!selectedPatient) return;
    setLoadingAi(true);
    setAiError("");
    setAiSummary(null);

    try {
      const response = await fetch("/api/copilot/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: selectedPatient.name,
          historyList: selectedPatient.history || []
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with CareFlow Clinical Copilot backend.");
      }

      const data = await response.json();
      setAiSummary(data);
    } catch (err: any) {
      setAiError(err.message || "An error occurred compiling medical history with Copilot.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="patients-tab-container">
      {/* Title Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-white">Electronic Health Records (EHR)</h2>
          <p className="text-sm text-slate-400">Secure directory of patient charts, active prescriptions, and clinical history.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-sm transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Directory List & Search */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 lg:col-span-1">
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg text-white">Patient Index</h3>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, ID, diagnosis..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="block text-slate-500 mb-1 font-semibold uppercase">Gender</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-400 focus:outline-none focus:border-teal-500"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1 font-semibold uppercase">Blood Group</label>
                <select
                  value={bloodFilter}
                  onChange={(e) => setBloodFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-400 focus:outline-none focus:border-teal-500"
                >
                  <option value="">All Bloods</option>
                  <option value="A-">A-</option>
                  <option value="O+">O+</option>
                  <option value="B+">B+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Directory Listings */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredPatients.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No medical charts found matching criteria.</p>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = selectedPatientId === patient.id;
                const isAdmitted = !!patient.roomNumber;

                return (
                  <div
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setAiSummary(null);
                    }}
                    className={`p-3.5 rounded-lg border cursor-pointer transition duration-200 flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-800/80 border-teal-500/60 shadow-md"
                        : "bg-slate-950/40 border-slate-800/60 hover:bg-slate-850 hover:border-slate-750"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white truncate">{patient.name}</span>
                        {isAdmitted && (
                          <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase shrink-0">
                            Admitted
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        ID: {patient.id} • Age {patient.age} • Gender {patient.gender}
                      </p>
                      <p className="text-[10px] text-teal-500 font-medium truncate">
                        {patient.diagnoses[0] || "No diagnosed conditions"}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition ${isSelected ? "text-teal-400 translate-x-0.5" : "text-slate-600"}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Medical Chart Viewer / Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 min-h-[500px]">
          {selectedPatient ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header Profile Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold text-lg">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">{selectedPatient.name}</h3>
                    <p className="text-xs text-slate-400">
                      Primary Medical Chart • <span className="font-mono text-teal-400">{selectedPatient.id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1 rounded text-slate-300">
                    Blood: <strong className="text-white">{selectedPatient.bloodType}</strong>
                  </span>
                  <span className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1 rounded text-slate-300">
                    Age: <strong className="text-white">{selectedPatient.age}</strong>
                  </span>
                  <span className="bg-slate-950 border border-slate-800 text-xs px-2.5 py-1 rounded text-slate-300">
                    Gender: <strong className="text-white">{selectedPatient.gender}</strong>
                  </span>
                  
                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete patient ${selectedPatient.name} from directory?`)) {
                        onDeletePatient(selectedPatient.id);
                        setSelectedPatientId(null);
                      }
                    }}
                    className="text-[10px] bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-300 px-2 py-1 rounded transition"
                  >
                    Delete Chart
                  </button>
                </div>
              </div>

              {/* Patient Core Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Contact & Care Coordinator */}
                <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Contact className="h-3.5 w-3.5 text-teal-400" />
                    Demographics & Contacts
                  </h4>
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-400">Phone: <strong className="text-slate-200">{selectedPatient.phone || "N/A"}</strong></p>
                    <p className="text-slate-400">Email: <strong className="text-slate-200">{selectedPatient.email || "N/A"}</strong></p>
                    <p className="text-slate-400">Emergency Contact:</p>
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-slate-300">
                      {selectedPatient.emergencyContact || "No Emergency Contact Registered"}
                    </div>
                  </div>
                </div>

                {/* Admission Room Bed Information */}
                <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-teal-400" />
                    Ward Admission Log
                  </h4>
                  {selectedPatient.roomNumber ? (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-400">Status: <strong className="text-emerald-400 uppercase">Admitted</strong></p>
                      <p className="text-slate-400">Room: <strong className="text-slate-200">{selectedPatient.roomNumber}</strong></p>
                      <p className="text-slate-400">Bed Allocation: <strong className="text-slate-200">{selectedPatient.bedId}</strong></p>
                      <p className="text-slate-400">Admission Date: <strong className="text-slate-200">{selectedPatient.admissionDate}</strong></p>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-xs text-slate-500 italic">Patient currently outpatient (Not Admitted)</p>
                      <p className="text-[10px] text-slate-400 mt-1">Go to Dashboard tab Ward status to assign a bed.</p>
                    </div>
                  )}
                </div>

                {/* Clinical Diagnoses & Active Allergies */}
                <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                    Clinical Conditions & Allergies
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Diagnoses</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPatient.diagnoses.length > 0 ? (
                          selectedPatient.diagnoses.map((diag, i) => (
                            <span key={i} className="bg-slate-900 border border-slate-800 text-[10px] px-2 py-0.5 rounded text-teal-300">
                              {diag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No Diagnoses Listed</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Drug/Food Allergies</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedPatient.allergies.length > 0 ? (
                          selectedPatient.allergies.map((all, i) => (
                            <span key={i} className="bg-rose-950/40 border border-rose-900/40 text-[10px] px-2 py-0.5 rounded text-rose-300">
                              {all}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No Allergies Listed (NKDA)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prescriptions & Medications */}
                <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5 text-teal-400" />
                    Active Prescription Meds
                  </h4>
                  
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {selectedPatient.medications.length > 0 ? (
                      selectedPatient.medications.map((med, i) => (
                        <div key={i} className="p-2 bg-slate-900 border border-slate-800/80 rounded flex justify-between items-center text-[11px]">
                          <div>
                            <span className="font-bold text-white">{med.name}</span>
                            <span className="text-slate-400 font-mono ml-2">({med.dosage})</span>
                          </div>
                          <span className="text-teal-400 font-mono text-[9px] uppercase tracking-wider bg-teal-950/40 border border-teal-900/40 px-1.5 py-0.5 rounded">
                            {med.frequency}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No active prescriptions listed.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Gemini clinical copilot summarization panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3" id="copilot-summary-box">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4.5 w-4.5 text-teal-400 fill-teal-400/20" />
                    <h4 className="text-sm font-semibold text-white">Clinical Copilot Patient Summary</h4>
                  </div>
                  <button
                    onClick={generateAiSummary}
                    disabled={loadingAi}
                    className="py-1 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded font-bold text-xs disabled:opacity-50 transition flex items-center space-x-1.5"
                  >
                    <span>{loadingAi ? "Analyzing..." : "Synthesize Narrative"}</span>
                  </button>
                </div>

                {loadingAi && (
                  <div className="p-4 bg-slate-900 rounded-lg text-center space-y-2 animate-pulse">
                    <div className="h-3 bg-slate-800 rounded w-3/4 mx-auto" />
                    <div className="h-3 bg-slate-800 rounded w-5/6 mx-auto" />
                    <p className="text-xs text-slate-500">Generating secure Shift-Handoff narrative using CareFlow clinical intelligence...</p>
                  </div>
                )}

                {aiError && (
                  <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded text-xs text-rose-300">
                    {aiError}
                  </div>
                )}

                {aiSummary && (
                  <div className="space-y-3.5 bg-slate-900 p-4 border border-slate-800 rounded-lg text-xs animate-fade-in">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Medical Journey Summary</p>
                      <p className="text-slate-300 leading-relaxed font-sans">{aiSummary.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60">
                      <div>
                        <p className="text-[10px] text-rose-400 font-bold uppercase mb-1.5">Critical Shifting Concerns</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                          {aiSummary.keyConcerns.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1.5">Recommended Clinical Actions</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                          {aiSummary.recommendedActions.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Append visit/admission clinical note history */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-800/60">
                  <History className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-semibold text-white">Clinical Note History (EHR)</h4>
                </div>

                {/* Shorthand History Addition Form */}
                <form onSubmit={handleAppendHistory} className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">File New Clinical Visit Note</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Visit Type</label>
                      <select
                        value={newHistoryType}
                        onChange={(e) => setNewHistoryType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 px-2 py-1.5 focus:outline-none focus:border-teal-500"
                      >
                        <option value="Consultation">Consultation</option>
                        <option value="Admission Note">Admission Note</option>
                        <option value="Discharge Note">Discharge Note</option>
                        <option value="Lab Review">Lab Review</option>
                        <option value="Intervention">Intervention</option>
                        <option value="Emergency Note">Emergency Note</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Attending Clinician</label>
                      <input
                        type="text"
                        value={newHistoryDoctor}
                        onChange={(e) => setNewHistoryDoctor(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                        placeholder="Dr. Jenkins, Dr. Chen..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Clinical Assessment Notes</label>
                    <textarea
                      value={newHistoryNotes}
                      onChange={(e) => setNewHistoryNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 p-2.5 focus:outline-none focus:border-teal-500"
                      placeholder="Enter clinical examination notes, subjective complaints, vital signs, prescriptions..."
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="py-1.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded text-xs transition"
                    >
                      Commit Clinical Note
                    </button>
                  </div>
                </form>

                {/* Historical Listings */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedPatient.history && selectedPatient.history.length > 0 ? (
                    selectedPatient.history.map((record, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-900 border border-slate-800/80 rounded-lg space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-teal-400 font-bold tracking-wider uppercase border border-teal-900/60 px-1.5 py-0.5 rounded bg-teal-950/30">
                            {record.type}
                          </span>
                          <span className="text-slate-500">{record.date}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{record.notes}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Attending: <strong className="text-slate-400">{record.doctorName}</strong></p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic text-center py-4">No health history records registered.</p>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 space-y-3">
              <ClipboardList className="h-12 w-12 text-slate-700 stroke-[1.5]" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">No Patient Chart Selected</p>
                <p className="text-xs text-slate-600 max-w-sm">Select a registered patient from the index directory list to view clinical history, active medications, and run Copilot evaluations.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Patient Registration Overlay/Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/35">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-teal-400" />
                <h3 className="font-display font-bold text-lg text-white">EHR Directory Enrollment</h3>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="e.g. Samuel Jackson"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Gender *</label>
                    <select
                      value={newPatientGender}
                      onChange={(e) => setNewPatientGender(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Blood Group</label>
                  <select
                    value={newPatientBlood}
                    onChange={(e) => setNewPatientBlood(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newPatientEmail}
                    onChange={(e) => setNewPatientEmail(e.target.value)}
                    placeholder="patient@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Emergency Contact (Name & Phone)</label>
                  <input
                    type="text"
                    value={newPatientEmergency}
                    onChange={(e) => setNewPatientEmergency(e.target.value)}
                    placeholder="Mary (Wife): +1 (555) 123-4567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Clinical Diagnoses (Comma Separated)</label>
                  <input
                    type="text"
                    value={newDiagnosesStr}
                    onChange={(e) => setNewDiagnosesStr(e.target.value)}
                    placeholder="Essential Hypertension, Type 2 Diabetes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Active Drug Allergies (Comma Separated)</label>
                  <input
                    type="text"
                    value={newAllergiesStr}
                    onChange={(e) => setNewAllergiesStr(e.target.value)}
                    placeholder="Penicillin, NSAIDs, Sulfa"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Medication Add Subsection */}
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Pill className="h-3.5 w-3.5 text-teal-400" />
                  <span>Configure Initial Prescriptions</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Drug Name</label>
                    <input
                      type="text"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      placeholder="Lisinopril"
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Dosage</label>
                    <input
                      type="text"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      placeholder="10mg"
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Frequency</label>
                      <input
                        type="text"
                        value={medFreq}
                        onChange={(e) => setMedFreq(e.target.value)}
                        placeholder="Once daily"
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMed}
                      className="bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 font-bold p-1.5 rounded transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Added Meds List */}
                {medsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {medsList.map((m, idx) => (
                      <span key={idx} className="inline-flex items-center space-x-1.5 bg-slate-950 border border-slate-800 text-[10px] px-2.5 py-1 rounded">
                        <span className="text-white font-semibold">{m.name} {m.dosage}</span>
                        <span className="text-slate-500">({m.frequency})</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMed(idx)}
                          className="text-slate-500 hover:text-red-400 transition"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800 pt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="py-2 px-4 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Enroll Patient Chart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
