import { Search, Bell, Clock, UserCircle, ShieldAlert, X, CheckCheck, AlertTriangle, Info } from 'lucide-react';
import { useAlarmContext } from '../../context/AlarmContext';
import { useRole, ROLES } from '../../context/RoleContext';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Topbar() {
  const { activeAlarmsCount, criticalCount, warningCount, alarms, acknowledgeAlarm } = useAlarmContext();
  const { role, setRole, theme } = useRole();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const recentAlarms = alarms.slice(0, 6);

  const severityIcon = (severity) => {
    if (severity === 'critical') return <ShieldAlert className="w-3.5 h-3.5 text-status-critical shrink-0" />;
    if (severity === 'warning') return <AlertTriangle className="w-3.5 h-3.5 text-status-warning shrink-0" />;
    return <Info className="w-3.5 h-3.5 text-status-selected shrink-0" />;
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 z-30 relative shrink-0">
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

        {/* Bell — Notification Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-1.5 rounded-md hover:bg-border/50 transition-colors"
          >
            <Bell className="w-4.5 h-4.5 text-text-secondary hover:text-text-primary transition-colors" />
            {activeAlarmsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-critical opacity-60" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-status-critical text-[9px] items-center justify-center text-white font-bold">
                  {activeAlarmsCount}
                </span>
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Notifications</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-text-secondary">{activeAlarmsCount} active</span>
                    <button onClick={() => setShowNotifications(false)} className="p-0.5 hover:bg-border rounded transition-colors">
                      <X className="w-3.5 h-3.5 text-text-secondary" />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto no-scrollbar divide-y divide-border/50">
                  {recentAlarms.length === 0 ? (
                    <div className="p-6 text-center text-text-secondary text-xs">
                      No active alarms — all systems nominal.
                    </div>
                  ) : (
                    recentAlarms.map((alarm) => (
                      <div key={alarm.id} className="px-4 py-3 hover:bg-background/50 transition-colors group">
                        <div className="flex items-start space-x-3">
                          {severityIcon(alarm.severity)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-primary truncate">{alarm.title}</p>
                            <p className="text-[10px] text-text-secondary mt-0.5 truncate">{alarm.zone} — {alarm.machine}</p>
                            <p className="text-[10px] text-text-secondary mt-1">{alarm.timestamp}</p>
                          </div>
                          {!alarm.acknowledged && (
                            <button
                              onClick={() => acknowledgeAlarm(alarm.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-status-healthy/10"
                              title="Acknowledge"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-status-healthy" />
                            </button>
                          )}
                          {alarm.acknowledged && (
                            <CheckCheck className="w-3.5 h-3.5 text-status-healthy/50 shrink-0" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-border bg-background/30">
                  <button className="w-full text-center text-[10px] font-semibold uppercase tracking-wider hover:text-text-primary text-text-secondary transition-colors">
                    View All Alarms
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Role Persona Switcher + Profile */}
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

          {/* Profile Button with Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: 'var(--role-accent)', backgroundColor: 'var(--role-accent-soft)' }}
            >
              <UserCircle className="w-5 h-5" style={{ color: 'var(--role-accent)' }} />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-64 bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                >
                  {/* Profile header */}
                  <div className="p-5 border-b border-border text-center">
                    <div
                      className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border-2 mb-3"
                      style={{ borderColor: 'var(--role-accent)', backgroundColor: 'var(--role-accent-soft)' }}
                    >
                      <UserCircle className="w-8 h-8" style={{ color: 'var(--role-accent)' }} />
                    </div>
                    <p className="text-sm font-semibold text-text-primary capitalize">{role}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">{theme.label}</p>
                    <div className="flex items-center justify-center mt-2 space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-healthy animate-pulse" />
                      <span className="text-[10px] text-status-healthy font-medium">Online</span>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {theme.permissions.map((perm) => (
                        <span key={perm} className="text-[9px] bg-border px-1.5 py-0.5 rounded text-text-secondary">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="p-2">
                    {[
                      { label: 'Switch to Operator',  value: ROLES.OPERATOR },
                      { label: 'Switch to Engineer',  value: ROLES.ENGINEER },
                      { label: 'Switch to Manager',   value: ROLES.MANAGER },
                    ].filter(opt => opt.value !== role).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setRole(opt.value); setShowProfile(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-border/50 rounded-md transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
