import React from 'react';
import { PlantMap } from '../map/PlantMap';
import { motion } from 'framer-motion';
import { Settings, Wrench, Activity, Database } from 'lucide-react';

export function EngineerView() {
  return (
    <main className="flex-1 flex relative min-w-0">
      <div className="flex-1 relative">
        <PlantMap />
        {/* Engineering Overlay: Node IDs and Status */}
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur border border-border p-3 rounded-lg z-10">
          <h4 className="text-[10px] font-bold text-text-secondary uppercase mb-2">System Health Overlay</h4>
          <div className="space-y-1">
            <div className="flex items-center text-[10px] text-text-primary">
              <span className="w-2 h-2 rounded-full bg-status-healthy mr-2" />
              Nodes Online: 12/12
            </div>
            <div className="flex items-center text-[10px] text-text-primary">
              <span className="w-2 h-2 rounded-full bg-status-warning mr-2" />
              Latency: 45ms
            </div>
          </div>
        </div>
      </div>

      {/* Engineer Toolbox Sidebar (Right side of the main area) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 bg-background border-l border-border p-5 overflow-y-auto hidden xl:block"
      >
        <h3 className="text-xs font-bold text-text-primary mb-6 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Engineering Toolbox
        </h3>

        <div className="space-y-6">
          <section>
            <h4 className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Maintenance Tools</h4>
            <div className="grid grid-cols-2 gap-2">
              <ToolButton icon={Wrench} label="Calibrate" />
              <ToolButton icon={Activity} label="Diagnostics" />
              <ToolButton icon={Database} label="I/O Map" />
              <ToolButton icon={Settings} label="Config" />
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Active Force/Overrides</h4>
            <div className="bg-status-warning/10 border border-status-warning/20 rounded p-3">
              <p className="text-[10px] text-status-warning leading-relaxed">
                Warning: 2 signals are currently forced. Manual overrides active on Zone_B.
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </main>
  );
}

function ToolButton({ icon: Icon, label }) {
  return (
    <button className="flex flex-col items-center justify-center p-3 bg-card border border-border rounded-lg hover:border-status-selected transition-colors group">
      <Icon className="w-5 h-5 text-text-secondary group-hover:text-status-selected mb-2" />
      <span className="text-[10px] font-medium text-text-secondary group-hover:text-text-primary">{label}</span>
    </button>
  );
}
