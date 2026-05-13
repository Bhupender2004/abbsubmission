import { Activity, Map, LayoutDashboard, Settings, Server } from "lucide-react";
import { useRole } from "../../context/RoleContext";

export function Sidebar() {
  const { role, theme } = useRole();
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
        <div 
          className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0 transition-colors"
          style={{ backgroundColor: 'var(--role-accent)' }}
        >
          <span className="text-background font-bold text-lg">ABB</span>
        </div>
        <div className="ml-4 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
          <span className="font-semibold text-text-primary whitespace-nowrap">PERSON 1</span>
          <span className="text-[10px] text-text-secondary whitespace-nowrap uppercase tracking-wider">{role} Mode</span>
        </div>
      </div>
      
      <nav className="flex-1 w-full space-y-2">
        {navItems.map((item, i) => (
          <button 
            key={i} 
            className={`w-full flex items-center px-5 py-3 transition-colors border-r-2 ${
              item.active 
                ? "bg-border text-text-primary" 
                : "text-text-secondary hover:bg-border/50 hover:text-text-primary border-transparent"
            }`}
            style={{ borderRightColor: item.active ? 'var(--role-accent)' : 'transparent' }}
          >
            <item.icon 
              className="w-5 h-5 shrink-0" 
              style={{ color: item.active ? 'var(--role-accent)' : 'inherit' }}
            />
            <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
