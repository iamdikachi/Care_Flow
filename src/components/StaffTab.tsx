import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  Shield, 
  Clock, 
  Briefcase,
  Layers,
  Heart
} from "lucide-react";
import { Staff } from "../types";

interface StaffTabProps {
  staffList: Staff[];
  onAddStaff: (newStaff: Omit<Staff, "id">) => void;
  onUpdateStaff: (id: string, updates: Partial<Staff>) => void;
  onDeleteStaff: (id: string) => void;
}

export default function StaffTab({
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff
}: StaffTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Staff State Form
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<'Doctor' | 'Nurse' | 'Pharmacist' | 'Administrator' | 'Receptionist'>('Nurse');
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [newShift, setNewShift] = useState<'Morning' | 'Evening' | 'Night'>('Morning');
  const [newStatus, setNewStatus] = useState<'On Duty' | 'Off Duty' | 'On Call'>('On Duty');
  const [newImage, setNewImage] = useState("");

  const roles = ["All", "Doctor", "Nurse", "Pharmacist", "Administrator", "Receptionist"];
  const statuses = ["All", "On Duty", "On Call", "Off Duty"];

  const filteredStaff = staffList.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.specialty && member.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "All" || member.role === roleFilter;
    const matchesStatus = statusFilter === "All" || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    onAddStaff({
      name: newName,
      role: newRole,
      specialty: newSpecialty || undefined,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@careflow.org`,
      phone: newPhone || "+1 (555) 000-0000",
      department: newDepartment || "General Ward",
      status: newStatus,
      shift: newShift,
      image: newImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
    });

    // Reset Form
    setNewName("");
    setNewRole("Nurse");
    setNewSpecialty("");
    setNewEmail("");
    setNewPhone("");
    setNewDepartment("");
    setNewShift("Morning");
    setNewStatus("On Duty");
    setNewImage("");
    setShowAddModal(false);
  };

  const handleStatusChange = (id: string, status: 'On Duty' | 'Off Duty' | 'On Call') => {
    onUpdateStaff(id, { status });
  };

  const handleShiftChange = (id: string, shift: 'Morning' | 'Evening' | 'Night') => {
    onUpdateStaff(id, { shift });
  };

  // Staff Counters
  const onDutyCount = staffList.filter(s => s.status === "On Duty").length;
  const onCallCount = staffList.filter(s => s.status === "On Call").length;

  return (
    <div className="space-y-6 animate-fade-in" id="staff-tab-container">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-white">Clinical Staff Roster & Shifts</h2>
          <p className="text-sm text-slate-400">Manage clinicians, nursing crew, pharmacists, and administrative staff roles, shifts, and check-in statuses.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/15"
        >
          <Plus className="h-4 w-4" />
          <span>Register Staff Member</span>
        </button>
      </div>

      {/* Roster KPI counters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Staff</p>
          <h3 className="text-3xl font-bold text-white tracking-tight mt-1">{staffList.length}</h3>
          <p className="text-[10px] text-slate-400 mt-2">Registered healthcare professionals</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Currently On Duty</p>
          <div className="flex items-center space-x-2 mt-1">
            <h3 className="text-3xl font-bold text-teal-400 tracking-tight">{onDutyCount}</h3>
            <span className="h-2.5 w-2.5 rounded-full bg-teal-400 animate-pulse" />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Active on immediate care shift</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On Call / Backup</p>
          <h3 className="text-3xl font-bold text-indigo-400 tracking-tight mt-1">{onCallCount}</h3>
          <p className="text-[10px] text-slate-400 mt-2">Standby personnel in queue</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nurses & Support</p>
          <h3 className="text-3xl font-bold text-amber-400 tracking-tight mt-1">
            {staffList.filter(s => s.role !== "Doctor").length}
          </h3>
          <p className="text-[10px] text-slate-400 mt-2">Vital non-physician caretakers</p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, department, specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 pl-10 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        {/* Role Filter selection */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-teal-500 transition"
          >
            <option value="All">All Roles (Doctors, Nurses, Support)</option>
            {roles.filter(r => r !== "All").map(r => (
              <option key={r} value={r}>{r}s</option>
            ))}
          </select>
        </div>

        {/* Status Filter selection */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:border-teal-500 transition"
          >
            <option value="All">All Status Levels</option>
            {statuses.filter(s => s !== "All").map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Users className="h-10 w-10 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-400">No matching staff member found</p>
            <p className="text-xs text-slate-500 mt-1">Refine your search criteria or register a new healthcare provider.</p>
          </div>
        ) : (
          filteredStaff.map((member) => {
            let statusClass = "bg-slate-800 text-slate-400 border-slate-700";
            if (member.status === "On Duty") {
              statusClass = "bg-teal-500/10 text-teal-400 border-teal-500/20";
            } else if (member.status === "On Call") {
              statusClass = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
            }

            return (
              <div 
                key={member.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition relative group shadow-lg"
              >
                {/* Delete overlay icon on hover */}
                <button
                  onClick={() => onDeleteStaff(member.id)}
                  title="Remove Staff Member"
                  className="absolute top-4 right-4 p-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="space-y-4">
                  {/* Photo & Role Label */}
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-14 w-14 rounded-xl object-cover bg-slate-800 border border-slate-800 shadow-md"
                    />
                    <div>
                      <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                        {member.role}
                      </span>
                      <h4 className="font-bold text-white text-base mt-1.5 leading-tight">{member.name}</h4>
                    </div>
                  </div>

                  {/* Core details */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Department</span>
                      <span className="text-slate-300 font-semibold">{member.department}</span>
                    </div>

                    {member.specialty && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Specialty</span>
                        <span className="text-slate-300 font-semibold truncate max-w-[140px]">{member.specialty}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Duty Shift</span>
                      <select
                        value={member.shift}
                        onChange={(e) => handleShiftChange(member.id, e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-teal-400"
                      >
                        <option value="Morning">Morning Shift</option>
                        <option value="Evening">Evening Shift</option>
                        <option value="Night">Night Shift</option>
                      </select>
                    </div>

                    {/* Quick Contact Info */}
                    <div className="pt-2 flex flex-col space-y-1.5 border-t border-slate-800/40">
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 text-slate-500" />
                        {member.email}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
                        <Phone className="h-3 w-3 text-slate-500" />
                        {member.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Toggle Row */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${statusClass}`}>
                    {member.status}
                  </span>

                  <select
                    value={member.status}
                    onChange={(e) => handleStatusChange(member.id, e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-[10px] text-slate-400 rounded px-1.5 py-1 focus:outline-none focus:border-teal-500"
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="On Call">On Call</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* STAFF REGISTRATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-display font-extrabold text-white text-base">Register Hospital Staff Member</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-left">
                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Staff Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nurse Jane Doe, Dr. Gregory House"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Staff Role Category *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Receptionist">Receptionist</option>
                  </select>
                </div>

                {/* Specialty */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Specialty area (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Critical Care, Pediatrics"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Official Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. name@hospital.org"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Active Phone/Pager Line</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 012-3456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Department Assigned *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICU, Emergency, Front Desk"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Primary Shift Assignment *</label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  >
                    <option value="Morning">Morning (06:00 - 14:00)</option>
                    <option value="Evening">Evening (14:00 - 22:00)</option>
                    <option value="Night">Night (22:00 - 06:00)</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Check-in Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  >
                    <option value="On Duty">On Duty</option>
                    <option value="On Call">On Call</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

                {/* Photo URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Photo Reference URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://images.unsplash.com/..."
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/15"
                >
                  Onboard to CareFlow Staff Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
