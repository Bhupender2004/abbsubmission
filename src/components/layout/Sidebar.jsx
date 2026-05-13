import { Activity, Map, LayoutDashboard, Settings, Server } from "lucide-react";

export function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: false },
    { icon: Activity, label: "Alarm Feed", active: false },
    { icon: Map, label: "Plant Map", active: true },
    { icon: Server, label: "Analytics", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  return (
    <aside className="w-16 hover:w-64 transition-all duration-300 ease-in-out bg-background border-r border-border h-screen flex flex-col items-start py-6 group overflow-hidden z-20 absolute lg:relative">
      <div className="px-4 mb-8 flex items-center w-full">
        <div className="w-8 h-8 bg-text-primary rounded-sm flex items-center justify-center shrink-0">
          <span className="text-background font-bold text-lg">P1</span>
        </div>
        <span className="ml-4 font-semibold text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">PERSON 1</span>
      </div>
      
      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item, i) => (
          <button 
            key={i} 
            className={`w-full flex items-center px-5 py-3 transition-colors ${
              item.active 
                ? "bg-border text-text-primary border-r-2 border-status-selected" 
                : "text-text-secondary hover:bg-border/50 hover:text-text-primary"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
