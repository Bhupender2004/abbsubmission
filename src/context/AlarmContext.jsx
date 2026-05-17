// =============================================================================
// AlarmContext.jsx — Global alarm state shared across all features
// =============================================================================
// Manages: alarms, selectedMachine, acknowledged/escalated state, active role
// Functions: acknowledgeAlarm, escalateAlarm, selectMachine, getAlarmsForMachine
// Now includes: alarm sound integration via useAlarmSound hook
// All features stay synchronized through this single context.
// =============================================================================

import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { initialAlarms, plantHierarchy, aiGlobalSummary } from '../data/mockData';
import { useAlarmSound } from '../hooks/useAlarmSound';

const AlarmContext = createContext(null);

export function AlarmProvider({ children }) {
  const [alarms, setAlarms] = useState(initialAlarms);
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [activeRole] = useState('operator');

  // ── Alarm actions ────────────────────────────────────────────────────────

  const acknowledgeAlarm = useCallback((id) => {
    setAlarms((prev) =>
      prev.map((alarm) => {
        if (alarm.id === id) {
          return { ...alarm, status: 'acknowledged', acknowledgedAt: new Date().toISOString() };
        }
        return alarm;
      })
    );
  }, []);

  const escalateAlarm = useCallback((id) => {
    setAlarms((prev) =>
      prev.map((alarm) => {
        if (alarm.id === id) {
          return { ...alarm, status: 'escalated', escalatedAt: new Date().toISOString() };
        }
        return alarm;
      })
    );
  }, []);

  // ── Machine selection ────────────────────────────────────────────────────

  const selectMachine = useCallback((machineId) => {
    if (machineId === null) {
      setSelectedMachineId(null);
    } else {
      setSelectedMachineId((prev) => (prev === machineId ? null : machineId));
    }
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────

  // Flatten hierarchy for fast lookup
  const allMachines = useMemo(() => {
    const machines = [];
    plantHierarchy.zones.forEach((zone) => {
      zone.machines.forEach((machine) => {
        machines.push({ ...machine, zoneName: zone.name, zoneId: zone.id });
      });
    });
    return machines;
  }, []);

  const selectedMachine = useMemo(() => {
    if (!selectedMachineId) return null;
    return allMachines.find((m) => m.id === selectedMachineId) || null;
  }, [selectedMachineId, allMachines]);

  // Active alarms (not acknowledged/escalated)
  const activeAlarms = useMemo(() => alarms.filter((a) => a.status === 'active'), [alarms]);
  const activeAlarmsCount = activeAlarms.length;

  // Counts by severity
  const criticalCount = useMemo(
    () => activeAlarms.filter((a) => a.severity === 'critical').length,
    [activeAlarms]
  );
  const warningCount = useMemo(
    () => activeAlarms.filter((a) => a.severity === 'warning').length,
    [activeAlarms]
  );

  // Get alarms for a specific machine
  const getAlarmsForMachine = useCallback(
    (machineId) => alarms.filter((a) => a.machineId === machineId),
    [alarms]
  );

  // Acknowledged and escalated lists
  const acknowledgedAlarms = useMemo(
    () => alarms.filter((a) => a.status === 'acknowledged'),
    [alarms]
  );
  const escalatedAlarms = useMemo(
    () => alarms.filter((a) => a.status === 'escalated'),
    [alarms]
  );

  // ── Alarm Sound Integration ──────────────────────────────────────────────
  const alarmSound = useAlarmSound(activeAlarms);

  // ── Context value ────────────────────────────────────────────────────────

  const value = useMemo(
    () => ({
      // Data
      alarms,
      activeAlarms,
      acknowledgedAlarms,
      escalatedAlarms,
      activeAlarmsCount,
      criticalCount,
      warningCount,
      allMachines,
      selectedMachineId,
      selectedMachine,
      activeRole,
      aiGlobalSummary,
      plantHierarchy,
      // Actions
      acknowledgeAlarm,
      escalateAlarm,
      selectMachine,
      getAlarmsForMachine,
      // Sound
      alarmSound,
    }),
    [
      alarms,
      activeAlarms,
      acknowledgedAlarms,
      escalatedAlarms,
      activeAlarmsCount,
      criticalCount,
      warningCount,
      allMachines,
      selectedMachineId,
      selectedMachine,
      activeRole,
      acknowledgeAlarm,
      escalateAlarm,
      selectMachine,
      getAlarmsForMachine,
      alarmSound,
    ]
  );

  return <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>;
}

export function useAlarmContext() {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarmContext must be used within an AlarmProvider');
  }
  return context;
}
