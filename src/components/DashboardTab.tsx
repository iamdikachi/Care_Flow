import React, { useState } from "react";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Activity, 
  BedDouble, 
  CheckCircle, 
  Clock, 
  Stethoscope,
  ChevronRight,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  UserCheck
} from "lucide-react";
import { Patient, Doctor, Appointment, Bed, Invoice } from "../types";

interface DashboardTabProps {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  beds: Bed[];
  invoices: Invoice[];
  onUpdateBed: (id: string, updates: Partial<Bed>) => void;
  onUpdateDoctorStatus: (id: string, status: 'On Duty' | 'Off Duty' | 'On Call') => void;
  onSelectPatient: (patientId: string) => void;
  onNavigate: (tabId: string) => void;
}

export default function DashboardTab({
  patients,
  doctors,
  appointments,
  beds,
  invoices,
  onUpdateBed,
  onUpdateDoctorStatus,
  onSelectPatient,
  onNavigate
}: DashboardTabProps) {
  // Stats calculations
  const totalPatients = patients.length;
  const activeAdmissions = beds.filter(b => b.status === "Occupied").length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr || a.date === "2026-07-14").length;
  const pendingInvoicesAmount = invoices
    .filter(inv => inv.status === "Pending")
    .reduce((sum, inv) => sum + inv.total, 0);

  // Active admissions percentage
  const totalBeds = beds.length;
  const occupancyRate = totalBeds > 0 ? Math.round((activeAdmissions / totalBeds) * 100) : 0;

  // Selected bed for management modal/state
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [assignPatientId, setAssignPatientId] = useState<string>("");

  const handleBedStatusChange = (bedId: string, status: 'Available' | 'Maintenance') => {
    onUpdateBed(bedId, { status, patientId: undefined, patientName: undefined });
    setSelectedBedId(null);
  };

  const handleAssignPatient = (bedId: string) => {
    if (!assignPatientId) return;
    const pat = patients.find(p => p.id === assignPatientId);
    if (pat) {
      onUpdateBed(bedId, {
        status: "Occupied",
        patientId: pat.id,
        patientName: pat.name
      });
      setSelectedBedId(null);
      setAssignPatientId("");
    }
  };

  const currentBed = beds.find(b => b.id === selectedBedId);
  const unassignedPatients = patients.filter(p => !beds.some(b => b.patientId === p.id));

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-tab-container">
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-white">Clinical Control Center</h2>
          <p className="text-sm text-slate-400">Real-time overview of current care operations, bed occupancy, and patient flows.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 text-sm">
          <span className="flex items-center text-teal-400 font-medium bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-teal-400 mr-2 animate-pulse" />
            Live Hospital Feed
          </span>
          <span className="text-slate-500 font-mono text-xs">Updated: Just now</span>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1 */}
        <div 
          onClick={() => onNavigate("patients")}
          className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition duration-200 cursor-pointer group"
          id="stat-patients"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered Patients</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{totalPatients}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition duration-200">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center text-xs text-slate-400 justify-between">
            <span>Electronic Health Records</span>
            <span className="text-teal-400 flex items-center font-medium">
              View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl" id="stat-occupancy">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed Occupancy Rate</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{occupancyRate}%</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BedDouble className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
              <span>{activeAdmissions} of {totalBeds} Beds Occupied</span>
              <span className="font-medium text-slate-300">Target &lt; 85%</span>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div 
          onClick={() => onNavigate("appointments")}
          className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition duration-200 cursor-pointer group"
          id="stat-appointments"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Visits</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{todayAppointments}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition duration-200">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center text-xs text-slate-400 justify-between">
            <span>Scheduled Consultations</span>
            <span className="text-emerald-400 flex items-center font-medium">
              Manage <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Stat 4 */}
        <div 
          onClick={() => onNavigate("billing")}
          className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition duration-200 cursor-pointer group"
          id="stat-billing"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unpaid Billing</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">${pendingInvoicesAmount.toLocaleString()}</h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition duration-200">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center text-xs text-slate-400 justify-between">
            <span>Pending Insurance/Private Invoices</span>
            <span className="text-amber-400 flex items-center font-medium">
              Billing Ledger <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bed Status Tracker & Ward Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-4" id="bed-manager-panel">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-white">Bed Registry & Ward Status</h3>
              <p className="text-xs text-slate-400">Click on any bed to manage admission status, discharges, or ward reassignments.</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                General
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                ICU
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {beds.map((bed) => {
              const isOccupied = bed.status === "Occupied";
              const isMaintenance = bed.status === "Maintenance";
              
              let statusColor = "bg-slate-800 hover:bg-slate-800/80 text-slate-300 border-slate-800";
              if (isOccupied) {
                statusColor = bed.type === "ICU" 
                  ? "bg-red-950/40 hover:bg-red-950/60 text-red-200 border-red-900/60" 
                  : "bg-teal-950/40 hover:bg-teal-950/60 text-teal-200 border-teal-900/60";
              } else if (isMaintenance) {
                statusColor = "bg-amber-950/40 hover:bg-amber-950/60 text-amber-200 border-amber-900/60";
              }

              return (
                <div
                  key={bed.id}
                  onClick={() => setSelectedBedId(bed.id)}
                  className={`border p-4 rounded-xl transition duration-200 cursor-pointer flex flex-col justify-between h-32 ${statusColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{bed.type} Ward</span>
                      <h4 className="font-bold text-white text-base mt-0.5">{bed.roomNumber}</h4>
                    </div>
                    <BedDouble className={`h-5 w-5 ${isOccupied ? "text-teal-400" : isMaintenance ? "text-amber-400" : "text-slate-500"}`} />
                  </div>

                  <div className="mt-3">
                    {isOccupied ? (
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-medium">Patient Assigned</p>
                        <p className="text-xs font-semibold text-slate-200 truncate">{bed.patientName}</p>
                      </div>
                    ) : isMaintenance ? (
                      <div>
                        <p className="text-xs font-medium text-amber-400">Sanitizing / Out</p>
                      </div>
                    ) : (
                      <div>
                        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          Available Bed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bed Manager Action Modal/Panel */}
          {selectedBedId && currentBed && (
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl mt-4 space-y-3 animate-fade-in" id="bed-action-modal">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Manage Bed: {currentBed.roomNumber} ({currentBed.type})</h4>
                  <p className="text-[11px] text-slate-400">Current Status: <span className="font-semibold uppercase text-slate-300">{currentBed.status}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedBedId(null)} 
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {currentBed.status === "Occupied" ? (
                  <>
                    <button
                      onClick={() => handleBedStatusChange(currentBed.id, "Available")}
                      className="flex items-center justify-center space-x-2 py-2 px-3 bg-teal-500 text-slate-950 rounded-lg text-xs font-semibold hover:bg-teal-400 transition"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>Discharge Patient / Free Bed</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (currentBed.patientId) onSelectPatient(currentBed.patientId);
                      }}
                      className="flex items-center justify-center space-x-2 py-2 px-3 bg-slate-800 text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-700 transition"
                    >
                      <span>View Patient EHR</span>
                    </button>

                    <button
                      onClick={() => handleBedStatusChange(currentBed.id, "Maintenance")}
                      className="flex items-center justify-center space-x-2 py-2 px-3 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold hover:bg-amber-500/25 transition"
                    >
                      <span>Place under Maintenance</span>
                    </button>
                  </>
                ) : (
                  <div className="col-span-3 flex flex-col md:flex-row items-center gap-3">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Assign Patient to Bed</label>
                      {unassignedPatients.length === 0 ? (
                        <p className="text-xs text-slate-500">No unadmitted patients found. Register them first.</p>
                      ) : (
                        <select
                          value={assignPatientId}
                          onChange={(e) => setAssignPatientId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
                        >
                          <option value="">-- Choose Patient --</option>
                          {unassignedPatients.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Age {p.age}, Blood {p.bloodType})</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex gap-2 w-full md:w-auto md:self-end">
                      <button
                        onClick={() => handleAssignPatient(currentBed.id)}
                        disabled={!assignPatientId}
                        className="flex-1 md:flex-initial py-2 px-4 bg-teal-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Assign Admission
                      </button>
                      
                      {currentBed.status !== "Maintenance" && (
                        <button
                          onClick={() => handleBedStatusChange(currentBed.id, "Maintenance")}
                          className="flex-1 md:flex-initial py-2 px-4 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition border border-amber-500/20"
                        >
                          Out of Service
                        </button>
                      )}

                      {currentBed.status === "Maintenance" && (
                        <button
                          onClick={() => handleBedStatusChange(currentBed.id, "Available")}
                          className="flex-1 md:flex-initial py-2 px-4 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition border border-emerald-500/20"
                        >
                          Complete Maintenance
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Medical Staff Registry status & shifts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between" id="staff-roster-panel">
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg text-white">On-Duty Medical Staff</h3>
            <p className="text-xs text-slate-400">Current status of primary physicians and specialists on call.</p>
          </div>

          <div className="space-y-3.5 my-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
            {doctors.map((doctor) => {
              let badgeColor = "bg-slate-800 text-slate-400 border-slate-700";
              if (doctor.status === "On Duty") {
                badgeColor = "bg-teal-500/10 text-teal-400 border-teal-500/20";
              } else if (doctor.status === "On Call") {
                badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
              }

              return (
                <div key={doctor.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/60">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img 
                      src={doctor.image} 
                      alt={doctor.name} 
                      className="h-10 w-10 rounded-lg object-cover bg-slate-800 border border-slate-700"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{doctor.name}</h4>
                      <p className="text-[10px] text-teal-400 font-medium">{doctor.specialty}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${badgeColor}`}>
                      {doctor.status}
                    </span>
                    <select
                      value={doctor.status}
                      onChange={(e) => onUpdateDoctorStatus(doctor.id, e.target.value as any)}
                      className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 rounded px-1.5 py-0.5 focus:outline-none focus:border-teal-500"
                    >
                      <option value="On Duty">On Duty</option>
                      <option value="On Call">On Call</option>
                      <option value="Off Duty">Off Duty</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800/60 text-center">
            <span className="text-[11px] text-slate-400 font-medium">
              CareFlow Roster Sync Server • Active
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Grid section with SVG charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="analytics-section">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-lg text-white">Daily Outpatient Flow & Ward admissions</h3>
              <p className="text-xs text-slate-400">Weekly patient visits breakdown by ward category and outpatient clinics.</p>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-teal-400 mr-1.5" /> Outpatient</span>
              <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-indigo-500 mr-1.5" /> Ward Admits</span>
            </div>
          </div>

          {/* Elegant customized SVG chart */}
          <div className="h-64 flex items-end justify-between px-4 pt-4 border-b border-l border-slate-800 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1 pt-4">
              <div className="border-t border-slate-800/40 w-full" />
              <div className="border-t border-slate-800/40 w-full" />
              <div className="border-t border-slate-800/40 w-full" />
              <div className="border-t border-slate-800/40 w-full" />
            </div>

            {/* Bars */}
            {[
              { day: "Mon", outpatient: 12, ward: 3 },
              { day: "Tue", outpatient: 19, ward: 5 },
              { day: "Wed", outpatient: 15, ward: 2 },
              { day: "Thu", outpatient: 22, ward: 6 },
              { day: "Fri", outpatient: 25, ward: 4 },
              { day: "Sat", outpatient: 8, ward: 1 },
              { day: "Sun", outpatient: 4, ward: 2 },
            ].map((d, index) => {
              const maxVal = 30;
              const opHeight = `${(d.outpatient / maxVal) * 100}%`;
              const wardHeight = `${(d.ward / maxVal) * 100}%`;

              return (
                <div key={index} className="flex flex-col items-center flex-1 group z-10">
                  <div className="flex items-end space-x-1.5 h-44 w-full justify-center">
                    {/* Outpatient Bar */}
                    <div 
                      className="bg-teal-400 rounded-t w-3 sm:w-4 transition-all duration-500 group-hover:bg-teal-300 relative"
                      style={{ height: opHeight }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none border border-slate-800">
                        {d.outpatient}
                      </div>
                    </div>
                    {/* Ward Bar */}
                    <div 
                      className="bg-indigo-500 rounded-t w-3 sm:w-4 transition-all duration-500 group-hover:bg-indigo-400 relative"
                      style={{ height: wardHeight }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none border border-slate-800">
                        {d.ward}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 font-mono">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health Index Indicators */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg text-white">Emergency Response Indices</h3>
            <p className="text-xs text-slate-400">Critical care metrics reflecting response timings and bed turnarounds.</p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">ER Admittance Wait Time</span>
                <span className="text-teal-400 font-mono">14.5 Mins (Optimum)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-400 h-full w-[85%] rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Operating Room (OR) Efficiency</span>
                <span className="text-indigo-400 font-mono">92.4% (Excellent)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full w-[92%] rounded-full" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Discharge Turnaround Period</span>
                <span className="text-emerald-400 font-mono">45 Mins (Fast)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[78%] rounded-full" />
              </div>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-lg text-[11px] text-slate-400 flex items-start space-x-2.5">
              <Activity className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <span>
                Systems synchronized across all ward sectors. Medical records, nurse rotations, and AI models are fully operational.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
