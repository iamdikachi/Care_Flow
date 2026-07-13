export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  availability: string[];
  image: string;
  status: 'On Duty' | 'Off Duty' | 'On Call';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface VisitHistory {
  date: string;
  type: string;
  notes: string;
  doctorName: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: string;
  phone: string;
  email: string;
  emergencyContact: string;
  admissionDate?: string;
  roomNumber?: string;
  bedId?: string;
  diagnoses: string[];
  allergies: string[];
  medications: Medication[];
  history: VisitHistory[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number;
  tax: number;
  total: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface Bed {
  id: string;
  roomNumber: string;
  type: 'ICU' | 'General' | 'Pediatric' | 'Semi-Private';
  status: 'Occupied' | 'Available' | 'Maintenance';
  patientId?: string;
  patientName?: string;
}

export interface DrugInventoryItem {
  id: string;
  name: string;
  genericName: string;
  category: string;
  stock: number;
  unit: string;
  dosage: string;
  minRequired: number;
  price: number;
  expiryDate: string;
  location: string;
}

export interface Staff {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Pharmacist' | 'Administrator' | 'Receptionist';
  specialty?: string;
  email: string;
  phone: string;
  department: string;
  status: 'On Duty' | 'Off Duty' | 'On Call';
  shift: 'Morning' | 'Evening' | 'Night';
  image: string;
}
