import { useAlarmContext } from '../../context/AlarmContext';
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
      <div className="p-5 border-b border-border">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary leading-tight">{machine.name}</h2>
            <p className="text-xs text-text-secondary mt-1">{machine.zoneName}</p>
          </div>
          <Badge variant={statusVariant}>{machine.status}</Badge>
        </div>

        <div className="flex items-center space-x-4 text-[10px] text-text-secondary mt-3">
          <span className="flex items-center bg-card border border-border rounded px-2 py-1">
            <Radio className="w-3 h-3 mr-1" />
            {machine.id.toUpperCase()}
          </span>
          <span className="flex items-center bg-card border border-border rounded px-2 py-1">
            <Clock className="w-3 h-3 mr-1" />
            {machine.operationalHours?.toLocaleString() || '—'} hrs
          </span>
          {machine.lastMaintenance && (
            <span className="flex items-center bg-card border border-border rounded px-2 py-1">
              <Wrench className="w-3 h-3 mr-1" />
              {machine.lastMaintenance}
            </span>
          )}
        </div>
      </div>

      {/* Live Telemetry */}
      <div className="p-5 border-b border-border">
        <h3 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.12em] mb-4">
          Live Sensor Data
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(machine.sensors).map(([key, value]) => {
            const meta = sensorMeta[key] || { icon: Activity, unit: '', label: key };
            const Icon = meta.icon;
            return (
              <div key={key} className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center text-text-secondary mb-1.5">
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
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
                {alarm.summary && (
                  <p className="text-[10px] text-text-secondary mt-1 leading-relaxed line-clamp-2">
                    {alarm.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nominal state */}
      {!hasAlarms && (
        <div className="p-5 flex-1 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-8 h-8 text-status-healthy mb-3" />
          <p className="text-xs text-text-secondary">All parameters within normal operating range.</p>
        </div>
      )}
    </motion.div>
  );
}
