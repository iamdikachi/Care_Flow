import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardTab from "./components/DashboardTab";
import PatientsTab from "./components/PatientsTab";
import AppointmentsTab from "./components/AppointmentsTab";
import BillingTab from "./components/BillingTab";
import CopilotTab from "./components/CopilotTab";
import InventoryTab from "./components/InventoryTab";
import StaffTab from "./components/StaffTab";
import PublicHomepage from "./components/PublicHomepage";
import PublicLogin from "./components/PublicLogin";
import { Patient, Doctor, Appointment, Bed, Invoice, DrugInventoryItem, Staff } from "./types";
import { Sparkles, AlertCircle } from "lucide-react";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicView, setPublicView] = useState<"home" | "login">("home");
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // App data states
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<DrugInventoryItem[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Selected patient for deep drill EHR inspection
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Copilot configurations status
  const [copilotConfigured, setCopilotConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // SYNC SERVICES (API BACKEND CONNECTIONS)
  // ==========================================

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    try {
      const [patientsRes, doctorsRes, appointmentsRes, bedsRes, billingRes, inventoryRes, staffRes, copilotRes] = await Promise.all([
        fetch("/api/patients"),
        fetch("/api/doctors"),
        fetch("/api/appointments"),
        fetch("/api/beds"),
        fetch("/api/billing"),
        fetch("/api/inventory"),
        fetch("/api/staff"),
        fetch("/api/copilot/status")
      ]);

      if (!patientsRes.ok || !doctorsRes.ok || !appointmentsRes.ok || !bedsRes.ok || !billingRes.ok || !inventoryRes.ok || !staffRes.ok) {
        throw new Error("Failed to load core data matrices from central CareFlow servers.");
      }

      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();
      const appointmentsData = await appointmentsRes.json();
      const bedsData = await bedsRes.json();
      const billingData = await billingRes.json();
      const inventoryData = await inventoryRes.json();
      const staffData = await staffRes.json();
      const copilotStatus = await copilotRes.json();

      setPatients(patientsData);
      setDoctors(doctorsData);
      setAppointments(appointmentsData);
      setBeds(bedsData);
      setInvoices(billingData);
      setInventory(inventoryData);
      setStaffList(staffData);
      setCopilotConfigured(copilotStatus.configured);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected network or application load error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Patients Actions
  const handleAddPatient = async (newPatient: Omit<Patient, "id">) => {
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatient)
      });
      if (res.ok) {
        const data = await res.json();
        setPatients([...patients, data]);
        setSelectedPatientId(data.id);
      }
    } catch (err) {
      console.error("Failed enrolling patient:", err);
    }
  };

  const handleUpdatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(patients.map(p => p.id === id ? data : p));
      }
    } catch (err) {
      console.error("Failed updating patient:", err);
    }
  };

  const handleDeletePatient = async (id: string) => {
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPatients(patients.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Failed deleting patient:", err);
    }
  };

  // Doctors actions
  const handleUpdateDoctorStatus = async (id: string, status: 'On Duty' | 'Off Duty' | 'On Call') => {
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(doctors.map(d => d.id === id ? data : d));
      }
    } catch (err) {
      console.error("Failed updating doctor status:", err);
    }
  };

  // Appointments Actions
  const handleAddAppointment = async (newApt: { patientId: string; doctorId: string; date: string; time: string; notes: string }) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApt)
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments([data, ...appointments]);
      }
    } catch (err) {
      console.error("Failed booking appointment:", err);
    }
  };

  const handleUpdateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(appointments.map(a => a.id === id ? data : a));
      }
    } catch (err) {
      console.error("Failed updating appointment:", err);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAppointments(appointments.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error("Failed removing appointment:", err);
    }
  };

  // Beds actions
  const handleUpdateBed = async (id: string, updates: Partial<Bed>) => {
    try {
      const res = await fetch(`/api/beds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        
        // Update beds list
        setBeds(beds.map(b => b.id === id ? data : b));
        
        // Refetch patients to sync ward room details immediately
        const patRes = await fetch("/api/patients");
        if (patRes.ok) {
          const patData = await patRes.json();
          setPatients(patData);
        }
      }
    } catch (err) {
      console.error("Failed updating bed assignment:", err);
    }
  };

  // Billing Actions
  const handleAddInvoice = async (newInvoice: { patientId: string; items: any[]; discount: number }) => {
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvoice)
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices([data, ...invoices]);
      }
    } catch (err) {
      console.error("Failed registering invoice:", err);
    }
  };

  const handleUpdateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const res = await fetch(`/api/billing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(invoices.map(i => i.id === id ? data : i));
      }
    } catch (err) {
      console.error("Failed updating invoice ledger:", err);
    }
  };

  // Fast navigation helper from dashboards
  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleSelectPatientFromHome = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab("patients");
  };

  // Drug Inventory Actions
  const handleAddInventoryItem = async (newItem: Omit<DrugInventoryItem, "id">) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        const data = await res.json();
        setInventory([...inventory, data]);
      }
    } catch (err) {
      console.error("Failed adding inventory item:", err);
    }
  };

  const handleUpdateInventoryItem = async (id: string, updates: Partial<DrugInventoryItem>) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setInventory(inventory.map(item => item.id === id ? data : item));
      }
    } catch (err) {
      console.error("Failed updating inventory item:", err);
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInventory(inventory.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed deleting inventory item:", err);
    }
  };

  // Staff Actions
  const handleAddStaff = async (newStaff: Omit<Staff, "id">) => {
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff)
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList([...staffList, data]);
        // Re-fetch doctors list to keep synced
        const docRes = await fetch("/api/doctors");
        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctors(docData);
        }
      }
    } catch (err) {
      console.error("Failed adding staff member:", err);
    }
  };

  const handleUpdateStaff = async (id: string, updates: Partial<Staff>) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(staffList.map(s => s.id === id ? data : s));
        // Re-fetch doctors list to keep synced
        const docRes = await fetch("/api/doctors");
        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctors(docData);
        }
      }
    } catch (err) {
      console.error("Failed updating staff member:", err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStaffList(staffList.filter(s => s.id !== id));
        // Re-fetch doctors to keep synced
        const docRes = await fetch("/api/doctors");
        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctors(docData);
        }
      }
    } catch (err) {
      console.error("Failed deleting staff member:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-slate-950 text-slate-100 min-h-screen font-sans items-center justify-center" id="app-wrapper">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto">
            <div className="h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <h3 className="font-display font-semibold text-slate-200">Synchronizing Central Server...</h3>
            <p className="text-xs text-slate-500 mt-1">Bootstrapping medical databases, records catalog, and clinical rulesets.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex bg-slate-950 text-slate-100 min-h-screen font-sans items-center justify-center p-8 text-center max-w-md mx-auto" id="app-wrapper">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-white text-lg">Server Handshake Failure</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={fetchInitialData}
            className="mt-2 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (publicView === "login") {
      return (
        <PublicLogin 
          onLogin={() => {
            setIsLoggedIn(true);
            setPublicView("home");
          }} 
          onBackToHome={() => setPublicView("home")} 
        />
      );
    }

    return (
      <PublicHomepage 
        doctors={doctors} 
        onNavigateToLogin={() => setPublicView("login")} 
      />
    );
  }

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen font-sans" id="app-wrapper">
      {/* Sidebar Nav */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        copilotConfigured={copilotConfigured} 
        onSignOut={() => {
          setIsLoggedIn(false);
          setPublicView("home");
        }}
      />

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto h-screen p-8 bg-slate-950">
        
        {/* Connection status header notifications */}
        {!copilotConfigured && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start space-x-3 text-xs text-amber-200">
            <AlertCircle className="h-4.5 w-4.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Clinical Copilot API Key Warning</p>
              <p className="leading-relaxed">
                The <code className="bg-amber-950/40 px-1 py-0.5 rounded text-amber-300">GEMINI_API_KEY</code> has not been set in the project Secrets panel. 
                AI clinical features will require this key. Please configure this key in your secrets panel to enable real-time clinical reasoning models.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {activeTab === "dashboard" && (
            <DashboardTab 
              patients={patients}
              doctors={doctors}
              appointments={appointments}
              beds={beds}
              invoices={invoices}
              onUpdateBed={handleUpdateBed}
              onUpdateDoctorStatus={handleUpdateDoctorStatus}
              onSelectPatient={handleSelectPatientFromHome}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === "patients" && (
            <PatientsTab 
              patients={patients}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
              selectedPatientId={selectedPatientId}
              setSelectedPatientId={setSelectedPatientId}
            />
          )}

          {activeTab === "appointments" && (
            <AppointmentsTab 
              appointments={appointments}
              patients={patients}
              doctors={doctors}
              onAddAppointment={handleAddAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
            />
          )}

          {activeTab === "billing" && (
            <BillingTab 
              invoices={invoices}
              patients={patients}
              onAddInvoice={handleAddInvoice}
              onUpdateInvoice={handleUpdateInvoice}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryTab 
              inventory={inventory}
              onAddItem={handleAddInventoryItem}
              onUpdateItem={handleUpdateInventoryItem}
              onDeleteItem={handleDeleteInventoryItem}
            />
          )}

          {activeTab === "staff" && (
            <StaffTab 
              staffList={staffList}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {activeTab === "copilot" && (
            <CopilotTab 
              patients={patients}
            />
          )}
        </div>
      </main>
    </div>
  );
}
