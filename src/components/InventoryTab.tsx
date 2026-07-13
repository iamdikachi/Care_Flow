import React, { useState } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  Trash2, 
  Edit, 
  MapPin, 
  FileText, 
  DollarSign, 
  CheckCircle,
  TrendingDown
} from "lucide-react";
import { DrugInventoryItem } from "../types";

interface InventoryTabProps {
  inventory: DrugInventoryItem[];
  onAddItem: (newItem: Omit<DrugInventoryItem, "id">) => void;
  onUpdateItem: (id: string, updates: Partial<DrugInventoryItem>) => void;
  onDeleteItem: (id: string) => void;
}

export default function InventoryTab({
  inventory,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}: InventoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);

  // New Drug Form State
  const [newName, setNewName] = useState("");
  const [newGenericName, setNewGenericName] = useState("");
  const [newCategory, setNewCategory] = useState("Antibiotics");
  const [newStock, setNewStock] = useState("");
  const [newUnit, setNewUnit] = useState("Tablets");
  const [newDosage, setNewDosage] = useState("");
  const [newMinRequired, setNewMinRequired] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Edit Drug Form State
  const [editStock, setEditStock] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const categories = ["All", "Antibiotics", "Antidiabetics", "Antihypertensives", "Statins / Lipids", "Bronchodilators", "Analgesics / NSAID", "General"];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newGenericName) return;

    onAddItem({
      name: newName,
      genericName: newGenericName,
      category: newCategory,
      stock: Number(newStock) || 0,
      unit: newUnit,
      dosage: newDosage || "N/A",
      minRequired: Number(newMinRequired) || 0,
      price: Number(newPrice) || 0,
      expiryDate: newExpiry || new Date().toISOString().split("T")[0],
      location: newLocation || "Pharmacy Central Shelf"
    });

    // Reset Form
    setNewName("");
    setNewGenericName("");
    setNewCategory("Antibiotics");
    setNewStock("");
    setNewUnit("Tablets");
    setNewDosage("");
    setNewMinRequired("");
    setNewPrice("");
    setNewExpiry("");
    setNewLocation("");
    setShowAddModal(false);
  };

  const handleOpenEdit = (item: DrugInventoryItem) => {
    setShowEditModal(item.id);
    setEditStock(String(item.stock));
    setEditPrice(String(item.price));
    setEditLocation(item.location);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;

    onUpdateItem(showEditModal, {
      stock: Number(editStock) || 0,
      price: Number(editPrice) || 0,
      location: editLocation
    });

    setShowEditModal(null);
  };

  // Low Stock Items check
  const lowStockItems = inventory.filter(item => item.stock <= item.minRequired);

  return (
    <div className="space-y-6 animate-fade-in" id="inventory-tab-container">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-white">Drug & Pharmacy Inventory Management</h2>
          <p className="text-sm text-slate-400">Monitor pharmaceutical stocks, low-quantity alerts, unit price logs, and storage locations.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 md:mt-0 flex items-center justify-center space-x-2 py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/15"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Medication</span>
        </button>
      </div>

      {/* Overview Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Unique Drugs</p>
          <h3 className="text-3xl font-bold text-white tracking-tight mt-1">{inventory.length}</h3>
          <p className="text-[10px] text-slate-400 mt-2">Active formulary items registered</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Low Stock Alerts</p>
          <div className="flex items-center space-x-2 mt-1">
            <h3 className="text-3xl font-bold text-white tracking-tight">{lowStockItems.length}</h3>
            {lowStockItems.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                Needs Restock
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Drugs at or below threshold limits</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Formulary Valuation</p>
          <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
            ${inventory.reduce((sum, item) => sum + (item.stock * item.price), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-400 mt-2">Total cash valuation of pharmacy stock</p>
        </div>
      </div>

      {/* Critical Alert Ribbon */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-rose-950/40 border border-rose-900/40 rounded-xl text-xs text-rose-300 flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Urgent Stock Warnings detected</p>
            <p className="text-rose-400/90">
              The following drugs have fallen below minimum required inventory levels and must be reordered immediately: {" "}
              <span className="font-semibold text-white">
                {lowStockItems.map(item => `${item.name} (${item.stock} left)`).join(", ")}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Search and Categories row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search drug name, generic identifier, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-teal-500 transition"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/30 font-bold"
                  : "bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                <th className="p-4">Medication details</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Dosage</th>
                <th className="p-4 text-center">In Stock / Unit</th>
                <th className="p-4 text-right">Price per Unit</th>
                <th className="p-4">Expiry / Location</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <Package className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                    <p className="font-semibold text-slate-400">No pharmaceuticals found</p>
                    <p className="text-xs text-slate-500 mt-1">Adjust your search term or filter category to locate items.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.stock <= item.minRequired;
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isLow ? "bg-rose-950/5 hover:bg-rose-950/10" : ""
                      }`}
                    >
                      {/* Name & Generic Name */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white text-sm flex items-center gap-1.5">
                            {item.name}
                            {isLow && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                Low
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 italic">{item.genericName}</p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                          {item.category}
                        </span>
                      </td>

                      {/* Dosage */}
                      <td className="p-4 text-right font-mono font-bold text-teal-400">
                        {item.dosage}
                      </td>

                      {/* In Stock */}
                      <td className="p-4 text-center">
                        <div className="space-y-1">
                          <p className={`text-sm font-bold font-mono ${isLow ? "text-rose-400" : "text-emerald-400"}`}>
                            {item.stock}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.unit}</p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="p-4 text-right font-mono text-slate-300 font-semibold">
                        ${item.price.toFixed(2)}
                      </td>

                      {/* Expiry & Location */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-[11px] text-slate-300 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-500" />
                            {item.location}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">Expires: {item.expiryDate}</p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Restock or Edit"
                            className="p-2 bg-slate-800 hover:bg-slate-750 text-teal-400 rounded-lg border border-slate-700/60 transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            title="Remove Drug"
                            className="p-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 rounded-lg border border-red-900/20 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. ADD NEW DRUG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="font-display font-extrabold text-white text-base">Add New Formulary Medication</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-left">
                {/* Brand Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Medication Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lipitor, Panadol"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Generic Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Generic Scientific Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atorvastatin Calcium, Paracetamol"
                    value={newGenericName}
                    onChange={(e) => setNewGenericName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Therapeutic Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  >
                    {categories.filter(c => c !== "All").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Active Dosage *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500mg, 10ml, 250mcg"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Stock Qty *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Unit type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stock Dispensing Unit *</label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  >
                    <option value="Tablets">Tablets</option>
                    <option value="Capsules">Capsules</option>
                    <option value="Inhalers">Inhalers</option>
                    <option value="Vials">Vials</option>
                    <option value="ml">ml (Liquid)</option>
                  </select>
                </div>

                {/* Min Required threshold */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Reorder Level Alert Qty *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 100"
                    value={newMinRequired}
                    onChange={(e) => setNewMinRequired(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price per Unit ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 0.45"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Batch Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Storage Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Storage Node/Shelf *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shelf C-3, Cabinet D"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/15"
                >
                  Register in Medical Formulary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT/RESTOCK DRUG MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <h3 className="font-display font-extrabold text-white text-base">Restock & Update Pricing</h3>
              <button
                onClick={() => setShowEditModal(null)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-4 text-left">
                {/* Brand Name display */}
                <div>
                  <p className="text-xs text-slate-400">Medication Brand Name</p>
                  <p className="text-sm font-bold text-white mt-1">
                    {inventory.find(i => i.id === showEditModal)?.name}
                  </p>
                </div>

                {/* Stock Edit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Adjust Stock Level Qty *</label>
                  <input
                    type="number"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Price Edit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Dispensation Price per Unit ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Location Edit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Storage Location *</label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Save Stock and Rate Adjustments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
