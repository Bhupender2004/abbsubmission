import React, { useState, useEffect } from 'react';
import { PlantMap } from '../map/PlantMap';
import { AlarmFeed } from '../alarm/AlarmFeed';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlarmContext } from '../../context/AlarmContext';
import { Volume2, VolumeX, AlertTriangle, ShieldAlert, Bell } from 'lucide-react';

export function OperatorView() {
  const { alarmSound, activeAlarmsCount } = useAlarmContext();
  const {
    isSilenced,
    silenceBlocked,
    silenceAlarms,
    canSilence,
    soundActive,
    activateAudio,
    SILENCE_THRESHOLD,
  } = alarmSound;

  const [showBlockedToast, setShowBlockedToast] = useState(false);

  const handleSilence = () => {
    const success = silenceAlarms();
    if (!success) setShowBlockedToast(true);
  };

  useEffect(() => {
    if (showBlockedToast) {
      const t = setTimeout(() => setShowBlockedToast(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showBlockedToast]);

  return (
    <main className="flex-1 flex relative min-w-0">
      <PlantMap />

      {/* Alarm Feed overlay */}
      <div className="absolute left-4 top-4 bottom-4 w-[380px] pointer-events-none z-10">
        <div className="h-full pointer-events-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-full">
            <AlarmFeed />
          </motion.div>
        </div>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-3 z-10">
        {/* Blocked toast */}
        <AnimatePresence>
          {showBlockedToast && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="bg-status-critical/20 backdrop-blur-md border border-status-critical/40 text-status-critical px-5 py-3 rounded-xl shadow-2xl max-w-[320px]">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Cannot Silence Alarms</p>
                  <p className="text-xs opacity-80 mt-1">{activeAlarmsCount} active alarms exceed the {SILENCE_THRESHOLD}-alarm threshold. Acknowledge alarms until ≤{SILENCE_THRESHOLD} remain.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sound status indicator */}
        {soundActive && !isSilenced && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-status-critical/15 backdrop-blur border border-status-critical/30 px-3 py-1.5 rounded-full flex items-center space-x-2">
            <Bell className="w-3.5 h-3.5 text-status-critical animate-pulse" />
            <span className="text-[10px] text-status-critical font-semibold">ALARM SOUNDING</span>
          </motion.div>
        )}

        <div className="flex space-x-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-status-critical text-white rounded-full font-bold shadow-lg shadow-status-critical/25">
            EMERGENCY STOP
          </motion.button>

          <motion.button
            whileHover={{ scale: canSilence ? 1.05 : 1 }}
            whileTap={{ scale: canSilence ? 0.95 : 1 }}
            onClick={() => { activateAudio(); handleSilence(); }}
            className={`px-6 py-3 rounded-full font-semibold shadow-lg transition-all flex items-center space-x-2 ${
              isSilenced ? 'bg-status-healthy/20 border border-status-healthy/40 text-status-healthy'
              : !canSilence ? 'bg-status-critical/10 border border-status-critical/30 text-status-critical cursor-not-allowed'
              : 'bg-card border border-border text-text-primary hover:bg-border/50'
            }`}>
            {isSilenced ? (<><VolumeX className="w-4 h-4" /><span>SILENCED</span></>)
            : !canSilence ? (<><AlertTriangle className="w-4 h-4 animate-pulse" /><span>BLOCKED ({activeAlarmsCount}{'>'}{SILENCE_THRESHOLD})</span></>)
            : (<><Volume2 className="w-4 h-4" /><span>SILENCE ALARMS</span></>)}
          </motion.button>
        </div>
      </div>
    </main>
  );
}
