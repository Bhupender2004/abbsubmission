import React, { useState, useEffect } from 'react';
import { PlantMap } from '../map/PlantMap';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Wrench, Activity, Database, X, Terminal, CheckCircle2 } from 'lucide-react';

export function EngineerView() {
  const [activeTool, setActiveTool] = useState(null);

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

      {/* Engineer Toolbox Sidebar */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 bg-background border-l border-border p-5 overflow-y-auto hidden xl:block z-10"
      >
        <h3 className="text-xs font-bold text-text-primary mb-6 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Engineering Toolbox
        </h3>

        <div className="space-y-6">
          <section>
            <h4 className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-3">Maintenance Tools</h4>
            <div className="grid grid-cols-2 gap-2">
              <ToolButton icon={Wrench} label="Calibrate" onClick={() => setActiveTool('Calibrate')} isActive={activeTool === 'Calibrate'} />
              <ToolButton icon={Activity} label="Diagnostics" onClick={() => setActiveTool('Diagnostics')} isActive={activeTool === 'Diagnostics'} />
              <ToolButton icon={Database} label="I/O Map" onClick={() => setActiveTool('I/O Map')} isActive={activeTool === 'I/O Map'} />
              <ToolButton icon={Settings} label="Config" onClick={() => setActiveTool('Config')} isActive={activeTool === 'Config'} />
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

      {/* Interactive Tool Modal */}
      <AnimatePresence>
        {activeTool && (
          <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />
        )}
      </AnimatePresence>
    </main>
  );
}

function ToolButton({ icon: Icon, label, onClick, isActive }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors group ${
        isActive 
          ? 'bg-[#1a1528] border-purple-500/50' 
          : 'bg-card border-border hover:border-status-selected'
      }`}
    >
      <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-purple-400' : 'text-text-secondary group-hover:text-status-selected'}`} />
      <span className={`text-[10px] font-medium ${isActive ? 'text-purple-300' : 'text-text-secondary group-hover:text-text-primary'}`}>
        {label}
      </span>
    </button>
  );
}

function ToolModal({ tool, onClose }) {
  const [output, setOutput] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (tool === 'Diagnostics') {
      const lines = [
        '> Init system diagnostic routine...',
        '> Verifying secure connection to PLC...',
        '> [OK] Connection established. Latency: 12ms',
        '> Scanning I/O modules...',
        '> [OK] 4 modules detected. Zero faults.',
        '> Verifying safety relay chains...',
        '> [OK] Safety loop closed.',
        '> Checking memory buffers...',
        '> [OK] Buffers nominal. No overflow.',
        '> --- All systems nominal ---'
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < lines.length) {
          setOutput(prev => [...prev, lines[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    } else if (tool === 'Calibrate') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + Math.floor(Math.random() * 15) + 5; // Random jumps for realism
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [tool]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-[#121214] border border-border rounded-xl shadow-2xl w-[500px] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-[#18181b]">
          <div className="flex items-center gap-2 text-text-primary font-medium">
            {tool === 'Diagnostics' && <Activity className="w-5 h-5 text-blue-400" />}
            {tool === 'Calibrate' && <Wrench className="w-5 h-5 text-purple-400" />}
            {tool === 'I/O Map' && <Database className="w-5 h-5 text-emerald-400" />}
            {tool === 'Config' && <Settings className="w-5 h-5 text-orange-400" />}
            {tool} Tool
          </div>
          <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 min-h-[300px]">
          
          {tool === 'Diagnostics' && (
             <div className="font-mono text-xs text-emerald-400 bg-black p-4 rounded border border-border/50 h-[250px] overflow-y-auto">
                <div className="flex items-center gap-2 mb-4 text-white/50 border-b border-white/10 pb-2">
                  <Terminal className="w-4 h-4" /> Diagnostic Terminal
                </div>
                <div className="space-y-1.5">
                  {output.map((line, idx) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={idx}>{line}</motion.div>
                  ))}
                  {output.length < 10 && <span className="animate-pulse inline-block w-2 h-4 bg-emerald-400 mt-1"></span>}
                </div>
             </div>
          )}

          {tool === 'Calibrate' && (
             <div className="flex flex-col items-center justify-center h-[250px] space-y-6">
                <div className="text-sm text-text-secondary">Running Auto-Calibration Routine</div>
                <div className="relative w-full max-w-sm h-3 bg-background rounded-full overflow-hidden border border-border">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", bounce: 0 }}
                  />
                </div>
                <div className="text-2xl font-mono text-white tracking-widest">{progress}%</div>
                <div className="h-6">
                  {progress === 100 && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center text-emerald-400 gap-2 font-medium">
                      <CheckCircle2 className="w-5 h-5" /> Sensors Calibrated Successfully
                    </motion.div>
                  )}
                </div>
             </div>
          )}

          {tool === 'I/O Map' && (
             <div className="grid grid-cols-2 gap-6 h-[250px]">
                <div className="border border-border rounded-lg bg-background p-4 flex flex-col">
                  <div className="text-[10px] font-bold text-text-secondary mb-3 uppercase tracking-wider flex items-center justify-between border-b border-border pb-2">
                    Digital Inputs <span className="text-emerald-400">LIVE</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs flex-1">
                    <div className="flex justify-between text-white"><span>DI_00 (Estop)</span> <span className="text-emerald-400">HIGH</span></div>
                    <div className="flex justify-between text-white"><span>DI_01 (Prox)</span> <span className="text-emerald-400">HIGH</span></div>
                    <div className="flex justify-between text-white"><span>DI_02 (Door)</span> <span className="text-text-secondary">LOW</span></div>
                    <div className="flex justify-between text-white"><span>DI_03 (Reset)</span> <span className="text-text-secondary">LOW</span></div>
                  </div>
                </div>
                <div className="border border-border rounded-lg bg-background p-4 flex flex-col">
                  <div className="text-[10px] font-bold text-text-secondary mb-3 uppercase tracking-wider flex items-center justify-between border-b border-border pb-2">
                    Digital Outputs <span className="text-emerald-400">LIVE</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs flex-1">
                    <div className="flex justify-between text-white"><span>DO_00 (Motor)</span> <span className="text-text-secondary">LOW</span></div>
                    <div className="flex justify-between text-white"><span>DO_01 (Valve)</span> <span className="text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]">HIGH</span></div>
                    <div className="flex justify-between text-white"><span>DO_02 (Lamp_G)</span> <span className="text-text-secondary">LOW</span></div>
                    <div className="flex justify-between text-white"><span>DO_03 (Lamp_R)</span> <span className="text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]">HIGH</span></div>
                  </div>
                </div>
             </div>
          )}

          {tool === 'Config' && (
             <div className="bg-black p-4 rounded border border-border h-[250px] overflow-y-auto relative group">
               <div className="absolute top-2 right-2 text-[10px] bg-white/10 text-white/50 px-2 py-1 rounded">system_config.json</div>
               <pre className="font-mono text-xs leading-relaxed text-orange-300">
{`{
  "system": {
    "mode": "engineering",
    "safety_override": false,
    "log_level": "verbose"
  },
  "network": {
    "ip_address": "192.168.10.45",
    "subnet_mask": "255.255.255.0",
    "gateway": "192.168.10.1",
    "protocol": "PROFINET"
  },
  "thresholds": {
    "temp_max_c": 85.0,
    "vib_max_mms": 2.4,
    "current_max_a": 45.0
  },
  "features": {
    "predictive_maintenance": true,
    "energy_saving_mode": false
  }
}`}
               </pre>
             </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
