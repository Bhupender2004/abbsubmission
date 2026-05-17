import { motion } from 'framer-motion';
import { useRole, ROLES, ROLE_THEMES } from '../../context/RoleContext';
import { useAlarmContext } from '../../context/AlarmContext';
import { Settings, Shield, Bell, Monitor, Palette, Users, Info } from 'lucide-react';

export function SettingsView() {
  const { role, setRole, theme } = useRole();
  const { plantHierarchy } = useAlarmContext();

  return (
    <main className="flex-1 bg-background-secondary p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight flex items-center">
              <Settings className="w-6 h-6 mr-3" style={{ color: 'var(--role-accent)' }} />
              System Settings
            </h2>
            <p className="text-text-secondary text-sm mt-1">
              {plantHierarchy.name} • {plantHierarchy.location}
            </p>
          </header>

          <div className="space-y-6">
            {/* Role / Persona Selector */}
            <section className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center">
                <Users className="w-4 h-4 mr-2" style={{ color: 'var(--role-accent)' }} />
                Active Persona
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(ROLE_THEMES).map(([roleName, roleTheme]) => {
                  const isActive = role === roleName;
                  return (
                    <button
                      key={roleName}
                      onClick={() => setRole(roleName)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isActive
                          ? 'border-current bg-current/5'
                          : 'border-border hover:border-text-secondary/30 bg-background'
                      }`}
                      style={isActive ? { borderColor: roleTheme.accent, backgroundColor: roleTheme.accentSoft } : {}}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: roleTheme.accent }} />
                        <span className="text-sm font-semibold text-text-primary">{roleName}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary leading-relaxed">{roleTheme.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {roleTheme.permissions.slice(0, 3).map((perm) => (
                          <span key={perm} className="text-[9px] bg-border px-1.5 py-0.5 rounded text-text-secondary">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center">
                <Bell className="w-4 h-4 mr-2" style={{ color: 'var(--role-accent)' }} />
                Notification Preferences
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Critical alarm audible alerts', enabled: true },
                  { label: 'Warning notification banner', enabled: true },
                  { label: 'Info-level event logging', enabled: false },
                  { label: 'AI summary auto-refresh', enabled: true },
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-xs text-text-primary">{pref.label}</span>
                    <div className={`w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${
                      pref.enabled ? '' : 'bg-border'
                    }`}
                      style={pref.enabled ? { backgroundColor: 'var(--role-accent)' } : {}}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        pref.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Display Settings */}
            <section className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center">
                <Monitor className="w-4 h-4 mr-2" style={{ color: 'var(--role-accent)' }} />
                Display
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Theme</div>
                  <div className="text-sm font-semibold text-text-primary">Industrial Dark</div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Refresh Rate</div>
                  <div className="text-sm font-semibold text-text-primary">1000ms</div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Map Zoom Default</div>
                  <div className="text-sm font-semibold text-text-primary">Fit View</div>
                </div>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Alarm Retention</div>
                  <div className="text-sm font-semibold text-text-primary">48 Hours</div>
                </div>
              </div>
            </section>

            {/* System Info */}
            <section className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center">
                <Info className="w-4 h-4 mr-2" style={{ color: 'var(--role-accent)' }} />
                System Information
              </h3>
              <div className="text-xs space-y-2 text-text-secondary">
                <div className="flex justify-between"><span>Platform Version</span><span className="text-text-primary">HMI v2.4.1</span></div>
                <div className="flex justify-between"><span>Connected Zones</span><span className="text-text-primary">{plantHierarchy.zones.length}</span></div>
                <div className="flex justify-between"><span>Total Machines</span><span className="text-text-primary">12</span></div>
                <div className="flex justify-between"><span>Uptime</span><span className="text-status-healthy font-medium">{plantHierarchy.uptime}%</span></div>
                <div className="flex justify-between"><span>Data Source</span><span className="text-text-primary">Mock / Demo</span></div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
