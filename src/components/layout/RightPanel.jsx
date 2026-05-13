import { useAlarmContext } from '../../context/AlarmContext';
import { useRole, ROLES } from '../../context/RoleContext';
import {
  Activity,
  Thermometer,
  Zap,
  Wind,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Radio,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const sensorMeta = {
  temperature: { icon: Thermometer, unit: '°C', label: 'Temperature' },
  vibration: { icon: Activity, unit: 'mm/s', label: 'Vibration' },
  pressure: { icon: Gauge, unit: 'PSI', label: 'Pressure' },
  flow: { icon: Wind, unit: 'L/min', label: 'Flow Rate' },
  speed: { icon: Zap, unit: 'RPM', label: 'Speed' },
  voltage: { icon: Zap, unit: 'V', label: 'Voltage' },
  torque: { icon: Gauge, unit: 'Nm', label: 'Torque' },
};

export function RightPanel() {
  const { selectedMachine, alarms } = useAlarmContext();

  return (
    <aside className="w-[340px] bg-background border-l border-border h-full flex flex-col z-10 relative shrink-0">
      <AnimatePresence mode="wait">
        {!selectedMachine ? <EmptyState key="empty" /> : <MachineDetail key={selectedMachine.id} machine={selectedMachine} alarms={alarms} />}
      </AnimatePresence>
    </aside>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-16 h-16 rounded-full bg-border/30 flex items-center justify-center mb-5">
        <Radio className="w-7 h-7 text-border" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-2">No Asset Selected</h3>
      <p className="text-xs text-text-secondary leading-relaxed max-w-[220px]">
        Select a machine from the map or alarm feed to view live telemetry and incident context.
      </p>
    </motion.div>
  );
}

function MachineDetail({ machine, alarms }) {
  const { role } = useRole();
  const machineAlarms = alarms.filter((a) => a.machineId === machine.id && a.status === 'active');
  const hasAlarms = machineAlarms.length > 0;
  const statusVariant = machine.status === 'critical' ? 'critical' : machine.status === 'warning' ? 'warning' : 'healthy';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col overflow-y-auto"
    >
      {/* Header */}
      <div className="p-5 border-b border-border relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-full h-1 opacity-50"
          style={{ backgroundColor: 'var(--role-accent)' }}
        />
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary leading-tight">{machine.name}</h2>
            <p className="text-xs text-text-secondary mt-1">{machine.zoneName}</p>
          </div>
          <Badge variant={statusVariant}>{machine.status}</Badge>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-text-secondary mt-3 overflow-x-auto pb-1 no-scrollbar">
          <span className="flex items-center bg-card border border-border rounded px-2 py-1 shrink-0">
            <Radio className="w-3 h-3 mr-1" />
            {machine.id.toUpperCase()}
          </span>
          <span className="flex items-center bg-card border border-border rounded px-2 py-1 shrink-0">
            <Clock className="w-3 h-3 mr-1" />
            {machine.operationalHours?.toLocaleString() || '—'} hrs
          </span>
        </div>
      </div>

      {/* Role-Specific Panels */}
      {role === ROLES.OPERATOR && (
        <div className="flex-1 flex flex-col">
          {/* Live Telemetry */}
          <div className="p-5 border-b border-border">
            <h3 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.12em] mb-4">
              Real-time Telemetry
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(machine.sensors).map(([key, value]) => {
                const meta = sensorMeta[key] || { icon: Activity, unit: '', label: key };
                const Icon = meta.icon;
                return (
                  <div key={key} className="bg-card border border-border rounded-lg p-3 hover:border-[var(--role-accent)]/30 transition-colors">
                    <div className="flex items-center text-text-secondary mb-1.5">
                      <Icon className="w-3.5 h-3.5 mr-1.5" style={{ color: 'var(--role-accent)' }} />
                      <span className="text-[10px] font-medium">{meta.label}</span>
                    </div>
                    <div className="text-xl font-semibold text-text-primary tracking-tight">
                      {value}
                      <span className="text-xs font-normal text-text-secondary ml-1">{meta.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Incidents */}
          {hasAlarms && (
            <div className="p-5">
              <h3 className="text-[10px] font-semibold text-status-critical uppercase tracking-[0.12em] mb-3 flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Active Incidents ({machineAlarms.length})
              </h3>
              <div className="space-y-2">
                {machineAlarms.map((alarm) => (
                  <div key={alarm.id} className="bg-status-critical/5 border border-status-critical/15 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="critical">{alarm.id}</Badge>
                      <span className="text-[10px] text-text-secondary">
                        {new Date(alarm.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-text-primary">{alarm.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {role === ROLES.ENGINEER && (
        <div className="flex-1 flex flex-col">
          <div className="p-5 border-b border-border">
            <h3 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.12em] mb-4">
              Maintenance Context
            </h3>
            <div className="space-y-3">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-secondary">Last Maintenance</span>
                  <span className="text-xs font-medium text-text-primary">{machine.lastMaintenance || 'Oct 12, 2025'}</span>
                </div>
                <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                  <div className="bg-status-healthy h-full w-[65%]" />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-text-secondary">Service Interval</span>
                  <span className="text-[10px] text-text-secondary">65% used</span>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-3">
                <h4 className="text-[10px] font-medium text-text-secondary mb-2">Upcoming Tasks</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-xs text-text-primary">
                    <Wrench className="w-3 h-3 mr-2 text-status-warning" />
                    Hydraulic Filter Replacement
                  </li>
                  <li className="flex items-center text-xs text-text-primary">
                    <Activity className="w-3 h-3 mr-2 text-status-healthy" />
                    Vibration Sensor Calibration
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <h3 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.12em] mb-4">
              Diagnostic Logs
            </h3>
            <div className="text-[10px] font-mono text-text-secondary space-y-1 opacity-70">
              <p>[09:12:45] SYSLOG: Motor current stable at 12.4A</p>
              <p>[09:10:22] WARN: Secondary pressure fluctuation detected</p>
              <p>[08:55:01] INFO: Calibration cycle completed successfully</p>
            </div>
          </div>
        </div>
      )}

      {role === ROLES.MANAGER && (
        <div className="flex-1 flex flex-col p-5">
          <h3 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.12em] mb-4">
            Productivity Overview
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-card border border-border rounded-lg p-4 border-l-4" style={{ borderLeftColor: 'var(--role-accent)' }}>
              <div className="text-[10px] text-text-secondary mb-1">Overall Equipment Effectiveness</div>
              <div className="text-2xl font-bold text-text-primary">84.2%</div>
              <div className="text-[10px] text-status-healthy mt-1">↑ 2.1% from last shift</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="text-[10px] text-text-secondary mb-1">Availability</div>
                <div className="text-lg font-semibold text-text-primary">98.4%</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="text-[10px] text-text-secondary mb-1">Quality Rate</div>
                <div className="text-lg font-semibold text-text-primary">99.1%</div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h4 className="text-[10px] font-medium text-text-secondary mb-3">Resource Allocation</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-text-primary">Energy Consumption</span>
                    <span className="text-text-secondary">42 kWh</span>
                  </div>
                  <div className="w-full bg-border h-1 rounded-full">
                    <div className="bg-status-warning h-full w-[78%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-text-primary">Operator Utilization</span>
                    <span className="text-text-secondary">92%</span>
                  </div>
                  <div className="w-full bg-border h-1 rounded-full">
                    <div className="bg-[var(--role-accent)] h-full w-[92%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nominal state (footer) */}
      {!hasAlarms && role === ROLES.OPERATOR && (
        <div className="p-5 border-t border-border mt-auto">
          <div className="flex items-center justify-center text-center py-4 bg-status-healthy/5 rounded-lg border border-status-healthy/20">
            <CheckCircle2 className="w-4 h-4 text-status-healthy mr-2" />
            <p className="text-[10px] text-text-secondary">System nominal.</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
