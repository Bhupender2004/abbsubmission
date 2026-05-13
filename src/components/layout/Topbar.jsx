import { Search, Bell, Clock, UserCircle, ShieldAlert } from 'lucide-react';
import { useAlarmContext } from '../../context/AlarmContext';
import { useRole, ROLES } from '../../context/RoleContext';
import { Badge } from '../ui/Badge';
import { useEffect, useState } from 'react';

export function Topbar() {
  const { activeAlarmsCount, criticalCount, warningCount } = useAlarmContext();
  const { role, setRole, theme } = useRole();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 z-10 relative shrink-0">
      {/* Left — Search */}
      <div className="flex items-center space-x-4 w-1/3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search machines, zones, alarms..."
            className="w-full bg-card border border-border text-xs text-text-primary rounded-md pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-status-selected/50 transition-shadow placeholder:text-text-secondary/50"
          />
        </div>
      </div>

      {/* Right — Status indicators */}
      <div className="flex items-center space-x-5">
        {/* Alarm summary */}
        <div className="flex items-center space-x-3 text-xs">
          {criticalCount > 0 && (
            <div className="flex items-center space-x-1.5 text-status-critical">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="font-semibold">{criticalCount}</span>
              <span className="text-text-secondary font-medium">CRIT</span>
            </div>
          )}
          {warningCount > 0 && (
            <div className="flex items-center space-x-1.5 text-status-warning">
              <span className="font-semibold">{warningCount}</span>
              <span className="text-text-secondary font-medium">WARN</span>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Clock */}
        <div className="flex items-center text-text-secondary space-x-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium tracking-wide tabular-nums">{time}</span>
        </div>

        {/* Uptime */}
        <div className="flex items-center space-x-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-status-healthy animate-pulse" />
          <span className="text-xs text-text-secondary font-medium">99.97%</span>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Bell */}
        <div className="relative">
          <Bell className="w-4.5 h-4.5 text-text-secondary hover:text-text-primary cursor-pointer transition-colors" />
          {activeAlarmsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-critical opacity-60" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-status-critical text-[9px] items-center justify-center text-white font-bold">
                {activeAlarmsCount}
              </span>
            </span>
          )}
        </div>

        {/* Role Persona Switcher */}
        <div className="flex items-center space-x-3 border-l border-border pl-5">
          <div className="flex flex-col items-end">
            <div className="relative group">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-card border border-border text-xs text-text-primary rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--role-accent)] appearance-none pr-6 cursor-pointer hover:bg-border/20 transition-colors"
                style={{ borderColor: 'var(--role-accent)' }}
              >
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r} className="bg-card text-text-primary">
                    {r}
                  </option>
                ))}
              </select>
              <div 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] pointer-events-none"
                style={{ borderTopColor: 'var(--role-accent)' }}
              />
            </div>
            <div className="text-[10px] text-text-secondary mt-1 flex items-center">
              <span 
                className="w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse" 
                style={{ backgroundColor: 'var(--role-accent)' }}
              />
              {theme.label}
            </div>
          </div>
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors"
            style={{ borderColor: 'var(--role-accent)', backgroundColor: 'var(--role-accent-soft)' }}
          >
            <UserCircle className="w-5 h-5 text-text-primary" style={{ color: 'var(--role-accent)' }} />
          </div>
        </div>
      </div>
    </header>
  );
}
