import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Check, 
  X, 
  User, 
  Stethoscope, 
  Search, 
  AlertCircle,
  FileText,
  CalendarCheck2
} from "lucide-react";
import { Appointment, Patient, Doctor } from "../types";

interface AppointmentsTabProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  onAddAppointment: (newApt: { patientId: string; doctorId: string; date: string; time: string; notes: string }) => void;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => void;
  onDeleteAppointment: (id: string) => void;
}

export default function AppointmentsTab({
  appointments,
  patients,
  doctors,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment
}: AppointmentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New appointment inputs
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [aptDate, setAptDate] = useState("");
  const [aptTime, setAptTime] = useState("");
  const [aptNotes, setAptNotes] = useState("");

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId || !aptDate || !aptTime) return;

    onAddAppointment({
      patientId: selectedPatientId,
      doctorId: selectedDoctorId,
      date: aptDate,
      time: aptTime,
      notes: aptNotes
    });

    // Reset fields
    setSelectedPatientId("");
    setSelectedDoctorId("");
    setAptDate("");
    setAptTime("");
    setAptNotes("");
    setShowAddForm(false);
  };

  const handleStatusChange = (id: string, status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled') => {
    onUpdateAppointment(id, { status });
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? a.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="appointments-tab-container">
      {/* Title Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-white">Clinical Consultation Scheduler</h2>
          <p className="text-sm text-slate-400">Coordinate specialist consulting times, checkups, and diagnostic lab slots.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Directory & Booking grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        {/* Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
          <div className="flex items-center space-x-2">
            <CalendarCheck2 className="h-5 w-5 text-teal-400" />
            <h3 className="font-display font-semibold text-lg text-white">Appointment Logbook</h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient, specialty..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-teal-500 transition"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Appointment Cards / Grid Grid-view */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-500 italic text-xs">
              No appointments found matching filters.
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              let statusStyle = "bg-slate-950 border-slate-800 text-slate-400";
              if (apt.status === "Scheduled") {
                statusStyle = "bg-teal-950/20 border-teal-800/40 text-teal-300";
              } else if (apt.status === "In Progress") {
                statusStyle = "bg-indigo-950/20 border-indigo-800/40 text-indigo-300";
              } else if (apt.status === "Completed") {
                statusStyle = "bg-emerald-950/20 border-emerald-800/40 text-emerald-300";
              } else if (apt.status === "Cancelled") {
                statusStyle = "bg-red-950/20 border-red-800/40 text-red-300";
              }

              return (
                <div 
                  key={apt.id} 
                  className={`border rounded-xl p-4 flex flex-col justify-between space-y-4 transition hover:border-slate-700 bg-slate-950/30 ${
                    apt.status === 'Completed' ? 'opacity-80' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-500 shrink-0" />
                        <span className="font-bold text-white text-sm truncate">{apt.patientName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-teal-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-300 truncate">{apt.doctorName}</span>
                        <span className="text-[10px] text-slate-500">({apt.specialty})</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold uppercase border px-2 py-0.5 rounded ${statusStyle}`}>
                      {apt.status}
                    </span>
                  </div>

                  {/* Notes / Symptoms */}
                  {apt.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/60 border border-slate-800/60 p-2.5 rounded font-sans leading-relaxed">
                      {apt.notes}
                    </p>
                  )}

                  {/* Bottom details & quick status modifier */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-teal-400" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-teal-400" />
                        {apt.time}
                      </span>
                    </div>

                    {/* Status actions */}
                    <div className="flex items-center gap-1.5">
                      {apt.status === "Scheduled" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(apt.id, "In Progress")}
                            className="bg-indigo-900/30 hover:bg-indigo-900/60 text-indigo-400 text-[10px] font-semibold px-2 py-1 rounded border border-indigo-800/40 transition"
                          >
                            Call Patient
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt.id, "Cancelled")}
                            className="text-slate-500 hover:text-red-400 text-[10px] font-semibold px-2 py-1 rounded hover:bg-red-500/10 transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {apt.status === "In Progress" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(apt.id, "Completed")}
                            className="bg-emerald-950/40 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-1 rounded border border-emerald-800/40 transition flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" /> Done
                          </button>
                          <button
                            onClick={() => handleStatusChange(apt.id, "Cancelled")}
                            className="text-slate-500 hover:text-red-400 text-[10px] font-semibold px-2 py-1 rounded transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {(apt.status === "Completed" || apt.status === "Cancelled") && (
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to remove this appointment record?")) {
                              onDeleteAppointment(apt.id);
                            }
                          }}
                          className="text-slate-600 hover:text-red-400 hover:bg-red-950/20 px-2 py-1 rounded transition text-[10px]"
                        >
                          Remove Log
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Book New Appointment Modal Form Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-teal-400" />
                <h3 className="font-display font-bold text-lg text-white">Schedule Consultation</h3>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="p-6 space-y-4">
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2.5 focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                  ))}
                </select>
              </div>

              {/* Select Physician / Specialist */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned Physician / Specialty *</label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2.5 focus:outline-none focus:border-teal-500"
                >
                  <option value="">-- Choose Attending Physician --</option>
                  {doctors.filter(d => d.status !== "Off Duty").map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty}) - {d.status}</option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Preferred Slot Time *</label>
                  <input
                    type="text"
                    required
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Clinical complaints / notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Symptom Notes / Clinical Objective</label>
                <textarea
                  value={aptNotes}
                  onChange={(e) => setAptNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 p-3 focus:outline-none focus:border-teal-500"
                  placeholder="e.g. Follow-up diagnostic check for asthma patches or acute throat aches..."
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-slate-800 pt-4 flex justify-end space-x-3">
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
                  Book Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
