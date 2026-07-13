import React from "react";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  Activity, 
  HeartHandshake,
  LogOut,
  Package,
  Shield
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  copilotConfigured: boolean;
  onSignOut?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, copilotConfigured, onSignOut }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: "Patient Records (EHR)", icon: Users },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "inventory", label: "Drug Inventory", icon: Package },
    { id: "billing", label: "Billing & Invoices", icon: CreditCard },
    { id: "staff", label: "Staff Roster", icon: Shield },
    { id: "copilot", label: "Clinical Copilot (AI)", icon: Sparkles, isAi: true }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 h-screen sticky top-0">
      {/* Hospital Logo/Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-md shadow-teal-500/20">
          <Activity className="h-6 w-6 text-slate-900 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg tracking-wide text-white">CareFlow</h1>
          <p className="text-[10px] font-mono text-teal-400 tracking-widest uppercase">EHR & Clinical Suite</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Medical Operations</p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-teal-500 text-slate-900 shadow-md shadow-teal-500/10"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-950" : "text-slate-400 group-hover:text-slate-100"}`} />
                <span>{item.label}</span>
              </div>
              
              {item.isAi && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider uppercase border ${
                  isActive 
                    ? "bg-slate-950 text-teal-400 border-teal-600" 
                    : copilotConfigured 
                      ? "bg-teal-950/40 text-teal-400 border-teal-800/60" 
                      : "bg-amber-950/40 text-amber-400 border-amber-900/60"
                }`}>
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
          <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">Central Clinical Server</p>
            <p className="text-[10px] text-slate-500 font-mono">PORT 3000 • SECURE</p>
          </div>
        </div>
        
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-red-950/40 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-lg text-xs font-semibold border border-red-900/20 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out of EHR</span>
          </button>
        )}

        <div className="text-center pt-1">
          <p className="text-[10px] text-slate-600 font-mono">© 2026 CareFlow Health</p>
        </div>
      </div>
    </aside>
  );
}
