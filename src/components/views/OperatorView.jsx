import React from 'react';
import { PlantMap } from '../map/PlantMap';
import { AlarmFeed } from '../alarm/AlarmFeed';
import { motion } from 'framer-motion';

export function OperatorView() {
  return (
    <main className="flex-1 flex relative min-w-0">
      <PlantMap />
      {/* Alarm Feed overlay — positioned on left side of map */}
      <div className="absolute left-4 top-4 bottom-4 w-[380px] pointer-events-none z-10">
        <div className="h-full pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            <AlarmFeed />
          </motion.div>
        </div>
      </div>
      
      {/* Quick Action Overlay for Operators */}
      <div className="absolute bottom-6 right-6 flex space-x-3 z-10">
        <button className="px-6 py-3 bg-status-critical text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
          EMERGENCY STOP
        </button>
        <button className="px-6 py-3 bg-card border border-border text-text-primary rounded-full font-semibold shadow-lg hover:bg-border/50 transition-colors">
          SILENCE ALARMS
        </button>
      </div>
    </main>
  );
}
