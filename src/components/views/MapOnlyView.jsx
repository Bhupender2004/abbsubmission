import { PlantMap } from '../map/PlantMap';
import { motion } from 'framer-motion';

export function MapOnlyView() {
  return (
    <main className="flex-1 flex relative min-w-0">
      <PlantMap />
      
      {/* Bottom action bar for map-specific controls */}
      <div className="absolute bottom-6 right-6 flex space-x-3 z-10">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 bg-status-critical text-white rounded-full text-xs font-bold shadow-lg shadow-status-critical/20"
        >
          EMERGENCY STOP
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 bg-card border border-border text-text-primary rounded-full text-xs font-semibold shadow-lg hover:bg-border/50 transition-colors"
        >
          SILENCE ALARMS
        </motion.button>
      </div>
    </main>
  );
}
