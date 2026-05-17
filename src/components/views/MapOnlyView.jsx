import { PlantMap } from '../map/PlantMap';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlarmContext } from '../../context/AlarmContext';
import { Volume2, VolumeX, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MapOnlyView() {
  const { alarmSound, activeAlarmsCount } = useAlarmContext();
  const {
    isSilenced,
    silenceBlocked,
    silenceAlarms,
    canSilence,
    SILENCE_THRESHOLD,
  } = alarmSound;

  const [showBlockedToast, setShowBlockedToast] = useState(false);

  const handleSilence = () => {
    const success = silenceAlarms();
    if (!success) {
      setShowBlockedToast(true);
    }
  };

  useEffect(() => {
    if (showBlockedToast) {
      const timer = setTimeout(() => setShowBlockedToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showBlockedToast]);

  return (
    <main className="flex-1 flex relative min-w-0">
      <PlantMap />
      
      {/* Bottom action bar for map-specific controls */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end space-y-3 z-10">
        {/* Blocked silence toast */}
        <AnimatePresence>
          {showBlockedToast && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-status-critical/20 backdrop-blur-md border border-status-critical/40 text-status-critical px-5 py-3 rounded-xl shadow-2xl max-w-[320px]"
            >
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Cannot Silence Alarms</p>
                  <p className="text-xs opacity-80 mt-1">
                    Acknowledge alarms until ≤{SILENCE_THRESHOLD} remain.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex space-x-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-status-critical text-white rounded-full text-xs font-bold shadow-lg shadow-status-critical/20"
          >
            EMERGENCY STOP
          </motion.button>
          <motion.button 
            whileHover={{ scale: canSilence ? 1.05 : 1 }}
            whileTap={{ scale: canSilence ? 0.95 : 1 }}
            onClick={handleSilence}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg transition-all flex items-center space-x-2 ${
              isSilenced
                ? 'bg-status-healthy/20 border border-status-healthy/40 text-status-healthy'
                : !canSilence
                ? 'bg-status-critical/10 border border-status-critical/30 text-status-critical cursor-not-allowed'
                : 'bg-card border border-border text-text-primary hover:bg-border/50'
            }`}
          >
            {isSilenced ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>SILENCED</span>
              </>
            ) : !canSilence ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span>BLOCKED</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>SILENCE ALARMS</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </main>
  );
}
