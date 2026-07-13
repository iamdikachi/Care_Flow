import React, { useState } from "react";
import { 
  CreditCard, 
  Plus, 
  Search, 
  X, 
  FileText, 
  Check, 
  AlertTriangle, 
  DollarSign, 
  Printer,
  Calendar,
  Layers,
  ChevronDown,
  User
} from "lucide-react";
import { Invoice, Patient, InvoiceItem } from "../types";

interface BillingTabProps {
  invoices: Invoice[];
  patients: Patient[];
  onAddInvoice: (newInvoice: { patientId: string; items: InvoiceItem[]; discount: number }) => void;
  onUpdateInvoice: (id: string, updates: Partial<Invoice>) => void;
}

export default function BillingTab({
  invoices,
  patients,
  onAddInvoice,
  onUpdateInvoice
}: BillingTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);

  // New Invoice form inputs
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [itemDesc, setItemDesc] = useState("");
  const [itemAmount, setItemAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const handleAddItem = () => {
    if (!itemDesc || itemAmount <= 0) return;
    setItems([...items, { description: itemDesc, amount: Number(itemAmount) }]);
    setItemDesc("");
    setItemAmount(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || items.length === 0) return;

    onAddInvoice({
      patientId: selectedPatientId,
      items,
      discount: Number(discountAmount)
    });

    // Reset fields
    setSelectedPatientId("");
    setItems([]);
    setItemDesc("");
    setItemAmount(0);
    setDiscountAmount(0);
    setShowAddForm(false);
  };

  const handlePayInvoice = (id: string) => {
    onUpdateInvoice(id, { status: "Paid" });
    if (selectedInvoiceForModal && selectedInvoiceForModal.id === id) {
      setSelectedInvoiceForModal({ ...selectedInvoiceForModal, status: "Paid" });
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? inv.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="billing-tab-container">
      {/* Title Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-white">Billing Ledger & Invoices</h2>
          <p className="text-sm text-slate-400">Manage ward admission invoices, specialized consultations, surgery allocations, and pharmacy charges.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 md:mt-0 flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-sm transition"
        >
          <Plus className="h-4 w-4" />
          <span>Generate Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Invoices Ledger Listing */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-800/60">
            <h3 className="font-display font-semibold text-base text-white">Consolidated Accounts Ledger</h3>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Invoice #, patient..."
                  className="w-full sm:w-48 pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-teal-500 transition"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 px-3 py-2 focus:outline-none focus:border-teal-500"
              >
                <option value="">All Billings</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Patient Profile</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Total Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 italic">No invoice items match the selection.</td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    let badgeColor = "bg-slate-950 text-slate-400 border-slate-850";
                    if (inv.status === "Paid") {
                      badgeColor = "bg-emerald-950/40 text-emerald-400 border-emerald-900/60";
                    } else if (inv.status === "Pending") {
                      badgeColor = "bg-amber-950/40 text-amber-400 border-amber-900/60";
                    } else if (inv.status === "Overdue") {
                      badgeColor = "bg-rose-950/40 text-rose-400 border-rose-900/60";
                    }

                    return (
                      <tr key={inv.id} className="hover:bg-slate-950/30 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{inv.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{inv.patientName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Patient: {inv.patientId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">{inv.date}</td>
                        <td className="py-3.5 px-4 font-bold text-teal-400 font-mono">${inv.total.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-mono font-bold uppercase border px-2 py-0.5 rounded ${badgeColor}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedInvoiceForModal(inv)}
                            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 transition"
                          >
                            Statement
                          </button>
                          {inv.status !== "Paid" && (
                            <button
                              onClick={() => handlePayInvoice(inv.id)}
                              className="text-xs text-slate-950 font-bold bg-teal-500 hover:bg-teal-400 px-2.5 py-1 rounded transition"
                            >
                              Collect
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Invoice Printing Preview Statement */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-1 h-fit" id="print-preview-pane">
          {selectedInvoiceForModal ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <h3 className="font-display font-semibold text-sm text-white">Itemized Medical Bill</h3>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 text-xs text-teal-400 hover:text-teal-300 font-medium"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>

              {/* Printable Invoice Card */}
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-4 text-xs font-sans text-slate-300">
                {/* Hospital Branding */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display font-bold text-white text-sm">CAREFLOW CLINICAL CTR</h4>
                    <p className="text-[9px] text-slate-500 leading-normal">
                      100 Careflow Blvd, Medical District<br />
                      Portland, OR 97201
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10px] font-bold text-white">{selectedInvoiceForModal.id}</p>
                    <p className="text-[9px] text-slate-500 font-mono">Date: {selectedInvoiceForModal.date}</p>
                    <p className="text-[9px] text-slate-500 font-mono">Due: {selectedInvoiceForModal.dueDate}</p>
                  </div>
                </div>

                {/* Patient Profile info */}
                <div className="border-t border-b border-slate-800 py-2">
                  <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Billing To:</p>
                  <p className="font-bold text-slate-200">{selectedInvoiceForModal.patientName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Registry Ref: {selectedInvoiceForModal.patientId}</p>
                </div>

                {/* List Items */}
                <div className="space-y-2">
                  <div className="grid grid-cols-4 font-bold text-[9px] uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-850">
                    <span className="col-span-3">Medical Description</span>
                    <span className="text-right">Amount</span>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {selectedInvoiceForModal.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-4 text-[11px]">
                        <span className="col-span-3 text-slate-300 leading-snug">{item.description}</span>
                        <span className="text-right font-mono text-slate-200">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom summaries */}
                <div className="border-t border-slate-800 pt-3 space-y-1 text-right text-[11px]">
                  {selectedInvoiceForModal.discount > 0 && (
                    <p className="text-slate-400">Discount Applied: <strong className="text-rose-400 font-mono">-${selectedInvoiceForModal.discount}</strong></p>
                  )}
                  <p className="text-slate-400">Estimated State Taxes: <strong className="text-slate-300 font-mono">${selectedInvoiceForModal.tax}</strong></p>
                  <p className="text-sm font-bold text-white pt-1">Total Fee Due: <span className="text-teal-400 font-mono">${selectedInvoiceForModal.total.toLocaleString()}</span></p>
                </div>

                {/* Status Watermark */}
                <div className="pt-2 text-center">
                  <span className={`inline-block text-[10px] font-mono font-extrabold uppercase border px-4 py-1 rounded-full ${
                    selectedInvoiceForModal.status === "Paid" 
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                      : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  }`}>
                    {selectedInvoiceForModal.status}
                  </span>
                </div>
              </div>

              {selectedInvoiceForModal.status !== "Paid" && (
                <button
                  onClick={() => handlePayInvoice(selectedInvoiceForModal.id)}
                  className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Collect Electronic Payment
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 text-slate-500 space-y-3">
              <FileText className="h-10 w-10 text-slate-700 stroke-[1.5]" />
              <div>
                <p className="text-xs font-semibold">Select Statement</p>
                <p className="text-[11px] text-slate-600 max-w-xs mt-1">Select an itemized invoice from the account ledger to print statements or collect payments.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate New Invoice Overlay Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/30">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-teal-400" />
                <h3 className="font-display font-bold text-lg text-white">Generate Charge Statement</h3>
              </div>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 space-y-4">
              {/* Select Patient */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Payer Patient Chart *</label>
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

              {/* Item Builder */}
              <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Itemized clinical Charges</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Item Description</label>
                    <input
                      type="text"
                      value={itemDesc}
                      onChange={(e) => setItemDesc(e.target.value)}
                      placeholder="e.g. Ward Daily Rate (3 Nights)"
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Amount ($)</label>
                    <input
                      type="number"
                      value={itemAmount}
                      onChange={(e) => setItemAmount(Number(e.target.value))}
                      placeholder="e.g. 1200"
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="py-1 px-3 bg-slate-800 border border-slate-750 text-teal-400 hover:text-teal-300 rounded font-semibold text-xs transition"
                  >
                    Add Line Item
                  </button>
                </div>

                {/* Items configured so far */}
                {items.length > 0 ? (
                  <div className="border-t border-slate-850 pt-2 space-y-1.5 max-h-[120px] overflow-y-auto">
                    {items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">{it.description}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-teal-400 font-semibold">${it.amount}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-500 hover:text-red-400 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">No charges added yet. Create at least one item.</p>
                )}
              </div>

              {/* Discount */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Direct Insurance/Private Discount ($)</label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Actions */}
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
                  disabled={items.length === 0}
                  className="py-2 px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Generate & Commit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
