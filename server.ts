import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured in Secrets.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// ==========================================
// IN-MEMORY DATA STORAGE (PRE-SEEDED)
// ==========================================

let doctors = [
  {
    id: "doc-1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    email: "s.jenkins@hospital.org",
    phone: "+1 (555) 123-4567",
    availability: ["Monday", "Wednesday", "Friday"],
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300",
    status: "On Duty"
  },
  {
    id: "doc-2",
    name: "Dr. Michael Chen",
    specialty: "Pediatrics",
    email: "m.chen@hospital.org",
    phone: "+1 (555) 234-5678",
    availability: ["Tuesday", "Wednesday", "Thursday"],
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
    status: "On Duty"
  },
  {
    id: "doc-3",
    name: "Dr. Elena Rostova",
    specialty: "Neurology",
    email: "e.rostova@hospital.org",
    phone: "+1 (555) 345-6789",
    availability: ["Monday", "Tuesday", "Thursday"],
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300",
    status: "On Call"
  },
  {
    id: "doc-4",
    name: "Dr. Marcus Vance",
    specialty: "Orthopedics",
    email: "m.vance@hospital.org",
    phone: "+1 (555) 456-7890",
    availability: ["Wednesday", "Friday"],
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    status: "On Duty"
  },
  {
    id: "doc-5",
    name: "Dr. Chloe Patel",
    specialty: "Dermatology",
    email: "c.patel@hospital.org",
    phone: "+1 (555) 567-8901",
    availability: ["Tuesday", "Friday"],
    image: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&q=80&w=300",
    status: "Off Duty"
  },
  {
    id: "doc-6",
    name: "Dr. James O'Connor",
    specialty: "General Medicine",
    email: "j.oconnor@hospital.org",
    phone: "+1 (555) 678-9012",
    availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300",
    status: "On Duty"
  }
];

let patients = [
  {
    id: "pat-1",
    name: "John Doe",
    age: 45,
    gender: "Male",
    bloodType: "O+",
    phone: "+1 (555) 987-6543",
    email: "john.doe@gmail.com",
    emergencyContact: "Mary Doe (Wife): +1 (555) 987-6540",
    admissionDate: "2026-07-01",
    roomNumber: "Room 201",
    bedId: "bed-g1",
    diagnoses: ["Essential Hypertension", "Type 2 Diabetes Mellitus"],
    allergies: ["Penicillin", "Peanuts"],
    medications: [
      { name: "Lisinopril", dosage: "10mg", frequency: "Once daily in the morning" },
      { name: "Metformin", dosage: "500mg", frequency: "Twice daily with meals" }
    ],
    history: [
      {
        date: "2026-07-01",
        type: "Admission",
        notes: "Admitted for blood pressure stabilization and general diabetes workup. Initial BP was 165/95 mmHg.",
        doctorName: "Dr. James O'Connor"
      },
      {
        date: "2026-07-05",
        type: "Consultation",
        notes: "ECG shows normal sinus rhythm. Lisinopril dosage adjusted to 10mg. Patient feeling less dizzy.",
        doctorName: "Dr. Sarah Jenkins"
      }
    ]
  },
  {
    id: "pat-2",
    name: "Jane Smith",
    age: 31,
    gender: "Female",
    bloodType: "A-",
    phone: "+1 (555) 876-5432",
    email: "jane.smith@yahoo.com",
    emergencyContact: "Thomas Smith (Brother): +1 (555) 876-5400",
    diagnoses: ["Severe Atopic Dermatitis", "Asthma"],
    allergies: ["Sulfonamides", "Shellfish"],
    medications: [
      { name: "Albuterol Inhaler", dosage: "90mcg/actuation", frequency: "2 puffs as needed for wheezing" },
      { name: "Fluticasone Cream", dosage: "0.05%", frequency: "Apply to affected areas twice daily" }
    ],
    history: [
      {
        date: "2026-06-15",
        type: "Outpatient Visit",
        notes: "Sought treatment for widespread eczema flare-up. Corticosteroid cream prescribed with safe taper instructions.",
        doctorName: "Dr. Chloe Patel"
      }
    ]
  },
  {
    id: "pat-3",
    name: "Robert Johnson",
    age: 68,
    gender: "Male",
    bloodType: "B+",
    phone: "+1 (555) 765-4321",
    email: "r.johnson@outlook.com",
    emergencyContact: "Alice Johnson (Daughter): +1 (555) 765-4300",
    admissionDate: "2026-07-10",
    roomNumber: "Room 101",
    bedId: "bed-icu1",
    diagnoses: ["Acute Coronary Syndrome", "Hyperlipidemia"],
    allergies: ["None known"],
    medications: [
      { name: "Atorvastatin", dosage: "40mg", frequency: "Once daily at bedtime" },
      { name: "Clopidogrel", dosage: "75mg", frequency: "Once daily" },
      { name: "Aspirin", dosage: "81mg", frequency: "Once daily" }
    ],
    history: [
      {
        date: "2026-07-10",
        type: "Emergency Admission",
        notes: "Admitted via ambulance with acute substernal chest discomfort radiating to left arm. Cardiac enzymes elevated.",
        doctorName: "Dr. James O'Connor"
      },
      {
        date: "2026-07-11",
        type: "Intervention",
        notes: "Successful drug-eluting stent placed in Left Anterior Descending (LAD) coronary artery. Patient in ICU for monitoring.",
        doctorName: "Dr. Sarah Jenkins"
      }
    ]
  },
  {
    id: "pat-4",
    name: "Emily Davis",
    age: 9,
    gender: "Female",
    bloodType: "O-",
    phone: "+1 (555) 654-3210",
    email: "davis.family@gmail.com",
    emergencyContact: "Sarah Davis (Mother): +1 (555) 654-3200",
    diagnoses: ["Persistent Moderate Asthma", "Seasonal Allergic Rhinitis"],
    allergies: ["Cat Dander", "Tree Pollen"],
    medications: [
      { name: "Montelukast", dosage: "5mg", frequency: "Once daily chewable at night" },
      { name: "Fluticasone Propionate Nasal", dosage: "50mcg", frequency: "1 spray each nostril daily" }
    ],
    history: [
      {
        date: "2026-05-20",
        type: "Pediatric Checkup",
        notes: "Asthma is well controlled. Peak expiratory flow rates are in the green zone. Refilled maintenance meds.",
        doctorName: "Dr. Michael Chen"
      }
    ]
  },
  {
    id: "pat-5",
    name: "Eleanor Vance",
    age: 72,
    gender: "Female",
    bloodType: "AB+",
    phone: "+1 (555) 543-2109",
    email: "e.vance@gmail.com",
    emergencyContact: "Arthur Vance (Husband): +1 (555) 543-2100",
    admissionDate: "2026-07-12",
    roomNumber: "Room 302",
    bedId: "bed-p1",
    diagnoses: ["Osteoarthritis of Knee", "Osteoporosis"],
    allergies: ["NSAIDs (causes rash)"],
    medications: [
      { name: "Acetaminophen ER", dosage: "650mg", frequency: "Every 8 hours as needed for joint pain" },
      { name: "Alendronate Sodium", dosage: "70mg", frequency: "Once weekly in morning on empty stomach" }
    ],
    history: [
      {
        date: "2026-07-12",
        type: "Surgery Admission",
        notes: "Admitted for planned Total Knee Arthroplasty (TKA). Pre-operative clearance obtained.",
        doctorName: "Dr. Marcus Vance"
      }
    ]
  }
];

let appointments = [
  {
    id: "apt-1",
    patientId: "pat-2",
    patientName: "Jane Smith",
    doctorId: "doc-5",
    doctorName: "Dr. Chloe Patel",
    specialty: "Dermatology",
    date: "2026-07-14",
    time: "10:00 AM",
    status: "Scheduled",
    notes: "Follow-up check on atopic dermatitis patches and adjustment of steroid cream taper plan."
  },
  {
    id: "apt-2",
    patientId: "pat-4",
    patientName: "Emily Davis",
    doctorId: "doc-2",
    doctorName: "Dr. Michael Chen",
    specialty: "Pediatrics",
    date: "2026-07-14",
    time: "02:30 PM",
    status: "Scheduled",
    notes: "Annual wellness checkup and spirometry breathing assessment."
  },
  {
    id: "apt-3",
    patientId: "pat-1",
    patientName: "John Doe",
    doctorId: "doc-6",
    doctorName: "Dr. James O'Connor",
    specialty: "General Medicine",
    date: "2026-07-15",
    time: "09:15 AM",
    status: "Scheduled",
    notes: "Routine lab results review and hypertension therapy adjustments."
  },
  {
    id: "apt-4",
    patientId: "pat-2",
    patientName: "Jane Smith",
    doctorId: "doc-2",
    doctorName: "Dr. Michael Chen",
    specialty: "Pediatrics",
    date: "2026-07-08",
    time: "11:00 AM",
    status: "Completed",
    notes: "Consultation regarding pediatric asthma flare-ups during pollen peaks. Transitioned to fluticasone regimen."
  }
];

let beds = [
  { id: "bed-icu1", roomNumber: "ICU-101", type: "ICU", status: "Occupied", patientId: "pat-3", patientName: "Robert Johnson" },
  { id: "bed-icu2", roomNumber: "ICU-101", type: "ICU", status: "Available" },
  { id: "bed-g1", roomNumber: "Gen-201", type: "General", status: "Occupied", patientId: "pat-1", patientName: "John Doe" },
  { id: "bed-g2", roomNumber: "Gen-201", type: "General", status: "Available" },
  { id: "bed-g3", roomNumber: "Gen-201", type: "General", status: "Available" },
  { id: "bed-p1", roomNumber: "Pvt-302", type: "Semi-Private", status: "Occupied", patientId: "pat-5", patientName: "Eleanor Vance" },
  { id: "bed-p2", roomNumber: "Pvt-302", type: "Semi-Private", status: "Available" }
];

let drugInventory = [
  {
    id: "drug-1",
    name: "Amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    category: "Antibiotics",
    stock: 450,
    unit: "Capsules",
    dosage: "500mg",
    minRequired: 150,
    price: 0.85,
    expiryDate: "2027-04-12",
    location: "Shelf A-3"
  },
  {
    id: "drug-2",
    name: "Metformin",
    genericName: "Metformin Hydrochloride",
    category: "Antidiabetics",
    stock: 80,
    unit: "Tablets",
    dosage: "500mg",
    minRequired: 100,
    price: 0.35,
    expiryDate: "2028-01-20",
    location: "Shelf B-1"
  },
  {
    id: "drug-3",
    name: "Lisinopril",
    genericName: "Lisinopril Dihydrate",
    category: "Antihypertensives",
    stock: 300,
    unit: "Tablets",
    dosage: "10mg",
    minRequired: 120,
    price: 0.45,
    expiryDate: "2027-09-18",
    location: "Shelf B-2"
  },
  {
    id: "drug-4",
    name: "Atorvastatin",
    genericName: "Atorvastatin Calcium",
    category: "Statins / Lipids",
    stock: 250,
    unit: "Tablets",
    dosage: "40mg",
    minRequired: 80,
    price: 1.10,
    expiryDate: "2027-11-05",
    location: "Shelf C-1"
  },
  {
    id: "drug-5",
    name: "Albuterol Inhaler",
    genericName: "Albuterol Sulfate",
    category: "Bronchodilators",
    stock: 45,
    unit: "Inhalers",
    dosage: "90mcg",
    minRequired: 50,
    price: 18.50,
    expiryDate: "2026-12-15",
    location: "Cabinet D (Cold)"
  },
  {
    id: "drug-6",
    name: "Ibuprofen",
    genericName: "Ibuprofen USP",
    category: "Analgesics / NSAID",
    stock: 600,
    unit: "Tablets",
    dosage: "400mg",
    minRequired: 200,
    price: 0.15,
    expiryDate: "2028-05-30",
    location: "Shelf A-1"
  }
];

let staff = [
  {
    id: "staff-1",
    name: "Dr. Sarah Jenkins",
    role: "Doctor",
    specialty: "Cardiology",
    email: "s.jenkins@hospital.org",
    phone: "+1 (555) 123-4567",
    department: "Cardiology",
    status: "On Duty",
    shift: "Morning",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "staff-2",
    name: "Dr. Michael Chen",
    role: "Doctor",
    specialty: "Pediatrics",
    email: "m.chen@hospital.org",
    phone: "+1 (555) 234-5678",
    department: "Pediatrics",
    status: "On Duty",
    shift: "Morning",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "staff-3",
    name: "Dr. Elena Rostova",
    role: "Doctor",
    specialty: "Neurology",
    email: "e.rostova@hospital.org",
    phone: "+1 (555) 345-6789",
    department: "Neurology",
    status: "On Call",
    shift: "Night",
    image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "staff-4",
    name: "Nurse Clara Barton",
    role: "Nurse",
    specialty: "Critical Care",
    email: "c.barton@hospital.org",
    phone: "+1 (555) 901-2345",
    department: "ICU Ward",
    status: "On Duty",
    shift: "Evening",
    image: "https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "staff-5",
    name: "Nurse Roger Federer",
    role: "Nurse",
    specialty: "General Medicine",
    email: "r.federer@hospital.org",
    phone: "+1 (555) 912-3456",
    department: "General Ward",
    status: "On Call",
    shift: "Morning",
    image: "https://images.unsplash.com/photo-1582973512609-4485d424346e?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "staff-6",
    name: "Pharmacist David Miller",
    role: "Pharmacist",
    specialty: "Clinical Pharmacy",
    email: "d.miller@hospital.org",
    phone: "+1 (555) 923-4567",
    department: "Pharmacy",
    status: "On Duty",
    shift: "Morning",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "staff-7",
    name: "Admin Alice Sterling",
    role: "Administrator",
    specialty: "Health Admin",
    email: "a.sterling@hospital.org",
    phone: "+1 (555) 934-5678",
    department: "Administration",
    status: "On Duty",
    shift: "Morning",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300"
  },
  {
    id: "staff-8",
    name: "Receptionist Lucy Liu",
    role: "Receptionist",
    specialty: "Customer Care",
    email: "l.liu@hospital.org",
    phone: "+1 (555) 945-6789",
    department: "Front Desk",
    status: "On Duty",
    shift: "Morning",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300"
  }
];

let invoices = [
  {
    id: "inv-1001",
    patientId: "pat-1",
    patientName: "John Doe",
    date: "2026-07-05",
    dueDate: "2026-08-05",
    items: [
      { description: "General Ward Daily Rate (4 Nights)", amount: 1600 },
      { description: "Cardiovascular Consultation Fee (Sarah Jenkins)", amount: 250 },
      { description: "Comprehensive Metabolic Panel & CBC Bloods", amount: 180 },
      { description: "In-Hospital Pharmacy (Metformin, Lisinopril)", amount: 45 }
    ],
    discount: 50,
    tax: 154,
    total: 2179,
    status: "Pending"
  },
  {
    id: "inv-1002",
    patientId: "pat-2",
    patientName: "Jane Smith",
    date: "2026-06-15",
    dueDate: "2026-07-15",
    items: [
      { description: "Outpatient Specialty Consultation (Chloe Patel)", amount: 180 },
      { description: "Allergen-Specific IgE Blood Assay", amount: 120 }
    ],
    discount: 0,
    tax: 24,
    total: 324,
    status: "Paid"
  },
  {
    id: "inv-1003",
    patientId: "pat-5",
    patientName: "Eleanor Vance",
    date: "2026-07-12",
    dueDate: "2026-08-12",
    items: [
      { description: "Orthopedic Surgical Theater Allocation", amount: 4500 },
      { description: "Total Knee Arthroplasty (Dr. Marcus Vance)", amount: 3200 },
      { description: "Post-Operative General Nursing Ward (1 Night)", amount: 400 },
      { description: "Physical Therapy Assessment & Mobility Session", amount: 150 }
    ],
    discount: 200,
    tax: 624,
    total: 8674,
    status: "Pending"
  }
];

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. PATIENTS
app.get("/api/patients", (req, res) => {
  res.json(patients);
});

app.post("/api/patients", (req, res) => {
  const { name, age, gender, bloodType, phone, email, emergencyContact, diagnoses, allergies, medications, history } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Patient Name is required" });
  }
  const newPatient = {
    id: `pat-${Date.now()}`,
    name,
    age: Number(age) || 30,
    gender: gender || "Male",
    bloodType: bloodType || "O+",
    phone: phone || "",
    email: email || "",
    emergencyContact: emergencyContact || "",
    diagnoses: Array.isArray(diagnoses) ? diagnoses : [],
    allergies: Array.isArray(allergies) ? allergies : [],
    medications: Array.isArray(medications) ? medications : [],
    history: Array.isArray(history) ? history : []
  };
  patients.push(newPatient);
  res.status(201).json(newPatient);
});

app.put("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  const index = patients.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Patient not found" });
  }
  patients[index] = { ...patients[index], ...req.body };
  res.json(patients[index]);
});

app.delete("/api/patients/:id", (req, res) => {
  const { id } = req.params;
  const index = patients.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Patient not found" });
  }
  patients.splice(index, 1);
  res.json({ success: true, message: "Patient deleted successfully" });
});

// 2. DOCTORS
app.get("/api/doctors", (req, res) => {
  res.json(doctors);
});

app.put("/api/doctors/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const doctor = doctors.find(d => d.id === id);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }
  if (status) {
    doctor.status = status;
  }
  res.json(doctor);
});

// 3. APPOINTMENTS
app.get("/api/appointments", (req, res) => {
  res.json(appointments);
});

app.post("/api/appointments", (req, res) => {
  const { patientId, doctorId, date, time, notes } = req.body;
  if (!patientId || !doctorId || !date || !time) {
    return res.status(400).json({ error: "Missing required appointment details" });
  }

  const patient = patients.find(p => p.id === patientId);
  const doctor = doctors.find(d => d.id === doctorId);

  if (!patient || !doctor) {
    return res.status(404).json({ error: "Patient or Doctor not found" });
  }

  const newApt = {
    id: `apt-${Date.now()}`,
    patientId,
    patientName: patient.name,
    doctorId,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date,
    time,
    status: "Scheduled" as const,
    notes: notes || ""
  };

  appointments.push(newApt);
  res.status(201).json(newApt);
});

app.put("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  appointments[index] = { ...appointments[index], ...req.body };
  res.json(appointments[index]);
});

app.delete("/api/appointments/:id", (req, res) => {
  const { id } = req.params;
  const index = appointments.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Appointment not found" });
  }
  appointments.splice(index, 1);
  res.json({ success: true });
});

// 4. BEDS
app.get("/api/beds", (req, res) => {
  res.json(beds);
});

app.put("/api/beds/:id", (req, res) => {
  const { id } = req.params;
  const { status, patientId, patientName } = req.body;
  const bed = beds.find(b => b.id === id);
  if (!bed) {
    return res.status(404).json({ error: "Bed not found" });
  }
  if (status !== undefined) bed.status = status;
  if (patientId !== undefined) bed.patientId = patientId;
  if (patientName !== undefined) bed.patientName = patientName;

  // Sync back to patient's ward information
  if (patientId && status === "Occupied") {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      patient.bedId = id;
      patient.roomNumber = bed.roomNumber;
      patient.admissionDate = new Date().toISOString().split('T')[0];
    }
  } else if (status === "Available" && bed.patientId) {
    const patient = patients.find(p => p.id === bed.patientId);
    if (patient) {
      delete patient.bedId;
      delete patient.roomNumber;
      delete patient.admissionDate;
    }
    delete bed.patientId;
    delete bed.patientName;
  }

  res.json(bed);
});

// 5. INVOICES / BILLING
app.get("/api/billing", (req, res) => {
  res.json(invoices);
});

app.post("/api/billing", (req, res) => {
  const { patientId, items, discount } = req.body;
  if (!patientId || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Patient ID and itemized list are required" });
  }
  const patient = patients.find(p => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const disc = Number(discount) || 0;
  const tax = Math.round((subtotal - disc) * 0.08); // 8% tax
  const total = Math.max(0, subtotal - disc + tax);

  const newInvoice = {
    id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
    patientId,
    patientName: patient.name,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days due
    items: items.map(i => ({ description: i.description, amount: Number(i.amount) })),
    discount: disc,
    tax,
    total,
    status: "Pending" as const
  };

  invoices.push(newInvoice);
  res.status(201).json(newInvoice);
});

app.put("/api/billing/:id", (req, res) => {
  const { id } = req.params;
  const index = invoices.findIndex(inv => inv.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }
  invoices[index] = { ...invoices[index], ...req.body };
  res.json(invoices[index]);
});

// 6. DRUG INVENTORY
app.get("/api/inventory", (req, res) => {
  res.json(drugInventory);
});

app.post("/api/inventory", (req, res) => {
  const { name, genericName, category, stock, unit, dosage, minRequired, price, expiryDate, location } = req.body;
  if (!name || !genericName) {
    return res.status(400).json({ error: "Drug name and generic name are required" });
  }
  const newItem = {
    id: `drug-${Date.now()}`,
    name,
    genericName,
    category: category || "General",
    stock: Number(stock) || 0,
    unit: unit || "Tablets",
    dosage: dosage || "N/A",
    minRequired: Number(minRequired) || 0,
    price: Number(price) || 0,
    expiryDate: expiryDate || new Date().toISOString().split("T")[0],
    location: location || "Pharmacy Cabinets"
  };
  drugInventory.push(newItem);
  res.status(201).json(newItem);
});

app.put("/api/inventory/:id", (req, res) => {
  const { id } = req.params;
  const index = drugInventory.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Drug item not found" });
  }
  drugInventory[index] = { ...drugInventory[index], ...req.body };
  res.json(drugInventory[index]);
});

app.delete("/api/inventory/:id", (req, res) => {
  const { id } = req.params;
  const index = drugInventory.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Drug item not found" });
  }
  drugInventory.splice(index, 1);
  res.json({ success: true, message: "Drug item removed from inventory" });
});

// 7. STAFF MANAGEMENT
app.get("/api/staff", (req, res) => {
  res.json(staff);
});

app.post("/api/staff", (req, res) => {
  const { name, role, specialty, email, phone, department, status, shift, image } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: "Staff Name and Role are required" });
  }
  const newStaff = {
    id: `staff-${Date.now()}`,
    name,
    role,
    specialty: specialty || "",
    email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@hospital.org`,
    phone: phone || "",
    department: department || "General Staff",
    status: status || "On Duty",
    shift: shift || "Morning",
    image: image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
  };
  staff.push(newStaff);
  
  // If role is doctor, sync to the doctors list as well for backward compatibility
  if (role === "Doctor") {
    doctors.push({
      id: newStaff.id,
      name: newStaff.name,
      specialty: newStaff.specialty,
      email: newStaff.email,
      phone: newStaff.phone,
      availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      image: newStaff.image,
      status: newStaff.status as any
    });
  }
  
  res.status(201).json(newStaff);
});

app.put("/api/staff/:id", (req, res) => {
  const { id } = req.params;
  const index = staff.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Staff member not found" });
  }
  staff[index] = { ...staff[index], ...req.body };
  
  // Sync back to doctor array if this staff is a Doctor
  if (staff[index].role === "Doctor") {
    const docIndex = doctors.findIndex(d => d.id === id);
    if (docIndex !== -1) {
      doctors[docIndex] = {
        ...doctors[docIndex],
        name: staff[index].name,
        specialty: staff[index].specialty || doctors[docIndex].specialty,
        email: staff[index].email,
        phone: staff[index].phone,
        status: staff[index].status as any,
        image: staff[index].image
      };
    }
  }
  
  res.json(staff[index]);
});

app.delete("/api/staff/:id", (req, res) => {
  const { id } = req.params;
  const index = staff.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Staff member not found" });
  }
  const deleted = staff.splice(index, 1)[0];
  
  // Sync deletion to doctor list if necessary
  if (deleted.role === "Doctor") {
    const docIndex = doctors.findIndex(d => d.id === id);
    if (docIndex !== -1) {
      doctors.splice(docIndex, 1);
    }
  }
  
  res.json({ success: true, message: "Staff member removed from roster" });
});

// ==========================================
// GEMINI AI CLINICAL COPILOT ROUTERS
// ==========================================

// Checks if Gemini is properly configured for the frontend info
app.get("/api/copilot/status", (req, res) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  res.json({ configured: isConfigured });
});

// 1. Clinical Symptom Analysis Helper
app.post("/api/copilot/symptoms", async (req, res) => {
  const { symptoms, patientAge, patientGender, patientHistory } = req.body;
  if (!symptoms) {
    return res.status(400).json({ error: "Symptom description is required" });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `You are an expert AI Clinical Decision Support Assistant (Clinical Copilot) in a high-tech modern hospital management system.
Your goal is to provide precise, structured clinical analysis to aid medical doctors.

Patient Demographics:
- Age: ${patientAge || "N/A"}
- Gender: ${patientGender || "N/A"}
- Critical Medical History: ${patientHistory || "None"}

Patient Reported Symptoms:
"${symptoms}"

Please provide a detailed assessment structured in standard medical format with the following JSON format:
{
  "differentialDiagnoses": [
    { "condition": "Primary Suspect", "probability": "High/Medium/Low", "reasoning": "Clinical reasoning based on symptoms..." }
  ],
  "suggestedDiagnosticTests": [
    { "testName": "Name of test (e.g. ECG, CBC, MRI)", "rationale": "Why this test is recommended" }
  ],
  "conservativeManagement": ["Immediate supportive therapies, hydration, rest, etc."],
  "redFlags": ["Emergency triage symptoms that warrant immediate critical/ER referral"]
}

Ensure your response is valid JSON strictly matching this schema. Avoid markdown wrapper in JSON string if possible, or if using markdown format, respond strictly with valid JSON inside a json codeblock. Do not include any other conversations outside the JSON block. Do not prescribe specific pharmaceutical doses to maintain clinical safety.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text || "{}";
    res.json(JSON.parse(textOutput));
  } catch (err: any) {
    console.error("Clinical symptom analysis failure:", err);
    res.status(500).json({ error: err.message || "Failed to conduct symptom analysis via Gemini API" });
  }
});

// 2. Clinical Notes to SOAP Format Optimizer
app.post("/api/copilot/soap", async (req, res) => {
  const { shorthandNotes } = req.body;
  if (!shorthandNotes) {
    return res.status(400).json({ error: "Shorthand clinical notes are required" });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `You are an experienced clinical scribe. Convert the following doctor's shorthand, rapid clinical bullet points into a beautifully formatted, structured, professional SOAP note (Subjective, Objective, Assessment, Plan).

Doctor's Shorthand Notes:
"${shorthandNotes}"

Return a JSON object with the following fields:
{
  "subjective": "Detailed subjective summary (patient symptoms, history of present illness, patient complaints)",
  "objective": "Detailed objective findings (vital signs, physical exam, lab results, observable status)",
  "assessment": "Clinical assessment and differential diagnoses based on subjective and objective data",
  "plan": "Detailed action plan (prescriptions, diagnostic test orders, counseling, next visit follow-up)"
}

Ensure the response is valid JSON. Use professional clinical vocabulary.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text || "{}";
    res.json(JSON.parse(textOutput));
  } catch (err: any) {
    console.error("SOAP compilation failure:", err);
    res.status(500).json({ error: err.message || "Failed to generate SOAP format clinical notes" });
  }
});

// 3. Clinical Summary of Medical History
app.post("/api/copilot/summary", async (req, res) => {
  const { patientName, historyList } = req.body;
  if (!historyList || !Array.isArray(historyList)) {
    return res.status(400).json({ error: "Valid history list is required" });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `You are a clinical supervisor. Summarize the medical visit history of patient "${patientName || "Unknown"}" into an executive medical narrative.
The summary is intended for quick handoff between hospital shifts.

Visit History Records:
${JSON.stringify(historyList, null, 2)}

Provide a JSON structured format:
{
  "summary": "A cohesive clinical narrative of the patient's journey, highlighting progress or deterioration.",
  "keyConcerns": ["Primary items of concern for the incoming medical shift team"],
  "recommendedActions": ["Immediate actions required (e.g. check vitals at 0800, redraw labs, prepare discharge)"]
}

Ensure valid JSON output.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text || "{}";
    res.json(JSON.parse(textOutput));
  } catch (err: any) {
    console.error("Clinical summary generation failure:", err);
    res.status(500).json({ error: err.message || "Failed to generate patient history summary" });
  }
});


// ==========================================
// VITE DEV SERVER & PRODUCTION ASSETS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "localhost", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
