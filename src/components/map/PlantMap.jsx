// =============================================================================
// PlantMap.jsx — Zoomable Aerial Site Plan
// =============================================================================
import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useAlarmContext } from '../../context/AlarmContext';
import { motion } from 'framer-motion';
import { Activity, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Badge } from '../ui/Badge';

// ─── Layout Data ────────────────────────────────────────────────────────────
const BUILDINGS = [
  { id: 'zone_cooling', label: 'Cooling Systems', sub: 'No.1', x: 160, y: 100, w: 200, h: 170, fill: '#AFC8E8', fillDark: '#3b6fa0', machines: ['pump_1','pump_2','chiller_1','valve_1'] },
  { id: 'zone_power', label: 'Power Generation', sub: 'No.2', x: 100, y: 50, w: 120, h: 100, fill: '#FFD6A0', fillDark: '#c48a30', machines: ['turb_1','turb_2','comp_1','gen_1'] },
  { id: 'casting', label: 'Casting', sub: '', x: 100, y: 155, w: 55, h: 115, fill: '#FFFFFF', fillDark: '#888', machines: [] },
  { id: 'zone_assembly', label: 'Assembly Line', sub: 'No.2', x: 420, y: 100, w: 200, h: 180, fill: '#F5A0B5', fillDark: '#c0506a', machines: ['robot_1','robot_2','conv_1','press_1'] },
  { id: 'powertrain', label: 'Powertrain', sub: '', x: 310, y: 165, w: 110, h: 55, fill: '#F5A0B5', fillDark: '#c0506a', machines: [] },
  { id: 'admin', label: 'Administration', sub: '', x: 230, y: 275, w: 170, h: 50, fill: '#E0E0E0', fillDark: '#777', machines: [] },
  { id: 'eco', label: 'Eco & Power\nCenter', sub: '', x: 30, y: 50, w: 60, h: 60, fill: '#C5E1A5', fillDark: '#6a9a30', machines: [] },
  { id: 'smelting', label: 'Smelting', sub: '', x: 30, y: 160, w: 60, h: 80, fill: '#CE93D8', fillDark: '#8a40a0', machines: [] },
  { id: 'parking1', label: 'Main Parking No2', sub: '', x: 80, y: 340, w: 120, h: 40, fill: '#F0F0F0', fillDark: '#999', machines: [] },
  { id: 'parking2', label: 'Main Parking No1', sub: '', x: 220, y: 340, w: 120, h: 40, fill: '#F0F0F0', fillDark: '#999', machines: [] },
  { id: 'north_parking', label: 'North Parking', sub: '', x: 530, y: 300, w: 100, h: 40, fill: '#F0F0F0', fillDark: '#999', machines: [] },
];

const TREES = [
  { x: 640, y: 130 }, { x: 640, y: 170 }, { x: 640, y: 210 }, { x: 640, y: 250 },
  { x: 640, y: 290 }, { x: 535, y: 350 }, { x: 570, y: 350 }, { x: 605, y: 350 },
  { x: 640, y: 350 }, { x: 25, y: 260 }, { x: 55, y: 260 }, { x: 25, y: 290 }, { x: 55, y: 290 },
];

const DEFAULT_VB = { x: -10, y: -10, w: 700, h: 420 };
const statusColors = { critical: '#FF4D4F', warning: '#FFB020', healthy: '#22C55E' };

// ─── Component ──────────────────────────────────────────────────────────────
function PlantMapInner() {
  const { selectMachine, selectedMachineId, activeAlarms, plantHierarchy } = useAlarmContext();
  const containerRef = useRef(null);
  const machineClickRef = useRef(false); // flag to block building click when machine clicked
  const [viewBox, setViewBox] = useState(DEFAULT_VB);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedZone, setSelectedZone] = useState(null);

  const zoneAlarmData = useMemo(() => {
    const map = {};
    BUILDINGS.forEach(b => {
      const alarms = activeAlarms.filter(a => b.machines.includes(a.machineId));
      const crit = alarms.filter(a => a.severity === 'critical').length;
      const warn = alarms.filter(a => a.severity === 'warning').length;
      map[b.id] = { total: alarms.length, critical: crit, warning: warn, status: crit > 0 ? 'critical' : warn > 0 ? 'warning' : 'healthy' };
    });
    return map;
  }, [activeAlarms]);

  const zoomScale = DEFAULT_VB.w / viewBox.w;
  const zoomLabel = zoomScale > 2 ? 'Machine Level' : zoomScale > 1.2 ? 'Zone Level' : 'Plant Overview';

  // ── Zoom helpers ──
  const zoomBy = useCallback((factor, centerX, centerY) => {
    setViewBox(p => {
      const nw = Math.max(120, Math.min(1200, p.w * factor));
      const nh = Math.max(72, Math.min(720, p.h * factor));
      const cx = centerX ?? (p.x + p.w / 2);
      const cy = centerY ?? (p.y + p.h / 2);
      const nx = cx - (cx - p.x) * (nw / p.w);
      const ny = cy - (cy - p.y) * (nh / p.h);
      return { x: nx, y: ny, w: nw, h: nh };
    });
  }, []);

  const zoomToRect = useCallback((rx, ry, rw, rh) => {
    // Center the rect in view with padding, maintain current aspect ratio
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const aspect = cRect.width / cRect.height;
    const pad = 40;
    let vw = rw + pad * 2;
    let vh = rh + pad * 2;
    // Fit to container aspect ratio
    if (vw / vh > aspect) {
      vh = vw / aspect;
    } else {
      vw = vh * aspect;
    }
    setViewBox({
      x: rx + rw / 2 - vw / 2,
      y: ry + rh / 2 - vh / 2,
      w: vw,
      h: vh,
    });
  }, []);

  // ── Mouse handlers ──
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const factor = e.deltaY > 0 ? 1.12 : 0.88;
    const mx = viewBox.x + (e.clientX - rect.left) / rect.width * viewBox.w;
    const my = viewBox.y + (e.clientY - rect.top) / rect.height * viewBox.h;
    zoomBy(factor, mx, my);
  }, [viewBox, zoomBy]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - panStart.x) / rect.width * viewBox.w;
    const dy = (e.clientY - panStart.y) / rect.height * viewBox.h;
    setViewBox(p => ({ ...p, x: p.x - dx, y: p.y - dy }));
    setPanStart({ x: e.clientX, y: e.clientY });
  }, [isPanning, panStart, viewBox]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const resetView = useCallback(() => {
    setViewBox(DEFAULT_VB);
    setSelectedZone(null);
  }, []);

  // ── Click handlers ──
  const handleBuildingClick = useCallback((b) => {
    // If a machine was just clicked, skip building handler
    if (machineClickRef.current) {
      machineClickRef.current = false;
      return;
    }
    if (b.id === selectedZone) {
      setSelectedZone(null);
      setViewBox(DEFAULT_VB);
      return;
    }
    setSelectedZone(b.id);
    if (b.machines.length > 0) {
      zoomToRect(b.x, b.y, b.w, b.h);
    }
  }, [selectedZone, zoomToRect]);

  const handleMachineClick = useCallback((e, machineId) => {
    machineClickRef.current = true; // block building click
    selectMachine(machineId);
  }, [selectMachine]);

  const getMachinesForBuilding = useCallback((b) => {
    if (!b.machines.length) return [];
    const result = [];
    plantHierarchy.zones.forEach(z => z.machines.forEach(m => {
      if (b.machines.includes(m.id)) result.push(m);
    }));
    return result;
  }, [plantHierarchy]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full absolute inset-0 z-0 cursor-grab active:cursor-grabbing select-none overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #d4e8d0 0%, #e8eee4 40%, #eaeae0 100%)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg width="100%" height="100%" viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#c0cbb8" strokeWidth="0.3" />
          </pattern>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ec8e3" />
            <stop offset="100%" stopColor="#b8dff0" />
          </linearGradient>
        </defs>

        {/* Ground */}
        <rect x="-50" y="-50" width="800" height="500" fill="#d5dfc8" />
        <rect x="-50" y="-50" width="800" height="500" fill="url(#grid)" />

        {/* Water body */}
        <path d="M -50,-50 L 750,-50 L 750,35 Q 600,55 400,40 Q 200,25 -50,45 Z" fill="url(#waterGrad)" opacity="0.7" />

        {/* Roads */}
        <rect x="20" y="318" width="650" height="12" rx="2" fill="#c8c4b8" />
        <line x1="30" y1="324" x2="660" y2="324" stroke="#e0dcd0" strokeWidth="1" strokeDasharray="8 6" />
        <rect x="92" y="45" width="6" height="300" fill="#c8c4b8" opacity="0.6" />
        <rect x="365" y="45" width="6" height="280" fill="#c8c4b8" opacity="0.6" />

        {/* Fence */}
        <rect x="15" y="38" width="660" height="310" rx="8" fill="none" stroke="#a0a090" strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="600" y="48" fontSize="7" fill="#606050" fontFamily="Inter, sans-serif" fontWeight="600">West Gate (Logistics)</text>

        {/* Green areas */}
        <ellipse cx="640" cy="200" rx="25" ry="90" fill="#8db870" opacity="0.5" />
        <rect x="530" y="340" width="120" height="30" rx="8" fill="#8db870" opacity="0.4" />
        <rect x="20" y="255" width="60" height="55" rx="6" fill="#8db870" opacity="0.4" />

        {/* Trees */}
        {TREES.map((t, i) => (
          <g key={i}><circle cx={t.x} cy={t.y} r="7" fill="#6b9f50" opacity="0.7" /><circle cx={t.x} cy={t.y} r="4.5" fill="#88b868" opacity="0.8" /></g>
        ))}

        {/* Parking markings */}
        {[0,1,2,3,4,5,6,7].map(i => (
          <g key={'pk'+i}>
            <rect x={85 + i*14} y={345} width="10" height="6" rx="1" fill="#d0cec0" stroke="#b0ae98" strokeWidth="0.5" />
            <rect x={225 + i*14} y={345} width="10" height="6" rx="1" fill="#d0cec0" stroke="#b0ae98" strokeWidth="0.5" />
          </g>
        ))}

        {/* Production info */}
        <text x="440" y="60" fontSize="6" fill="#606050" fontFamily="Inter, sans-serif">No.1 Line : Start of production December 2005</text>
        <text x="440" y="70" fontSize="6" fill="#606050" fontFamily="Inter, sans-serif">No.2 Line : Start of production April 2008</text>

        {/* Pipeline connections */}
        <line x1={160} y1={185} x2={100} y2={185} stroke="#FFB020" strokeWidth="2" strokeDasharray="4 3" opacity="0.6" />
        <line x1={360} y1={185} x2={420} y2={185} stroke="#999" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />

        {/* ── BUILDINGS ── */}
        {BUILDINGS.map(b => {
          const alarm = zoneAlarmData[b.id] || { total: 0, status: 'healthy' };
          const isSelected = selectedZone === b.id;
          const hasMachines = b.machines.length > 0;
          const glowColor = statusColors[alarm.status];
          const showMachines = isSelected && hasMachines;
          const machines = showMachines ? getMachinesForBuilding(b) : [];

          return (
            <g key={b.id} onClick={() => handleBuildingClick(b)} style={{ cursor: hasMachines ? 'pointer' : 'default' }}>
              {/* Glow */}
              {alarm.total > 0 && (
                <rect x={b.x - 4} y={b.y - 4} width={b.w + 8} height={b.h + 8} rx="6" fill="none" stroke={glowColor} strokeWidth="2.5" opacity="0.5">
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
                </rect>
              )}

              {/* Shadow */}
              <rect x={b.x + 2} y={b.y + 2} width={b.w} height={b.h} rx="4" fill="#00000020" />

              {/* Body */}
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="4"
                fill={b.fill} stroke={isSelected ? '#2563eb' : alarm.total > 0 ? glowColor : '#a0a090'}
                strokeWidth={isSelected ? 2.5 : 1} opacity="0.9" />

              {/* Labels (hide when showing machines) */}
              {!showMachines && (
                <>
                  {b.sub && <text x={b.x + b.w / 2} y={b.y + b.h * 0.3} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="700" fill={b.fillDark} fontFamily="Inter, sans-serif" opacity="0.7">{b.sub}</text>}
                  {b.label.split('\n').map((line, li) => {
                    const totalLines = b.label.split('\n').length;
                    const lineY = b.y + b.h * 0.55 + (li - (totalLines - 1) / 2) * 13;
                    return (
                      <text key={li} x={b.x + b.w / 2} y={lineY}
                        textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="600" fill={b.fillDark} fontFamily="Inter, sans-serif">{line}</text>
                    );
                  })}
                </>
              )}

              {/* Zone title when machines visible */}
              {showMachines && (
                <text x={b.x + b.w / 2} y={b.y + 12} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="700" fill={b.fillDark} fontFamily="Inter, sans-serif">{b.label}</text>
              )}

              {/* Alarm badge */}
              {alarm.total > 0 && (
                <g>
                  <circle cx={b.x + b.w - 10} cy={b.y + 10} r="8" fill={glowColor} />
                  {alarm.status === 'critical' && (
                    <circle cx={b.x + b.w - 10} cy={b.y + 10} r="8" fill={glowColor} opacity="0.4">
                      <animate attributeName="r" values="8;14;8" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <text x={b.x + b.w - 10} y={b.y + 13} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{alarm.total}</text>
                </g>
              )}

              {/* Machine cards */}
              {machines.map((m, mi) => {
                const cols = 2;
                const col = mi % cols;
                const row = Math.floor(mi / cols);
                const pad = 8;
                const gap = 5;
                const mw = (b.w - pad * 2 - gap) / 2;
                const mh = (b.h - 28 - pad - gap) / 2;
                const mx = b.x + pad + col * (mw + gap);
                const my = b.y + 24 + row * (mh + gap);
                const mc = statusColors[m.status];
                const isSel = selectedMachineId === m.id;
                const clipId = `clip-${b.id}-${m.id}`;
                const maxChars = Math.floor(mw / 5.5);
                const displayName = m.name.length > maxChars ? m.name.slice(0, maxChars) + '\u2026' : m.name;

                return (
                  <g key={m.id} onClick={(e) => handleMachineClick(e, m.id)} style={{ cursor: 'pointer' }}>
                    <defs>
                      <clipPath id={clipId}>
                        <rect x={mx + 1} y={my + 1} width={mw - 2} height={mh - 2} />
                      </clipPath>
                    </defs>
                    <rect x={mx} y={my} width={mw} height={mh} rx="4"
                      fill={isSel ? '#dbeafe' : '#ffffffee'} stroke={isSel ? '#2563eb' : mc}
                      strokeWidth={isSel ? 2.5 : 1} />
                    <g clipPath={`url(#${clipId})`}>
                      {/* Status dot */}
                      <circle cx={mx + 9} cy={my + mh * 0.3} r="3.5" fill={mc} />
                      {m.status === 'critical' && (
                        <circle cx={mx + 9} cy={my + mh * 0.3} r="3.5" fill={mc} opacity="0.5">
                          <animate attributeName="r" values="3.5;7;3.5" dur="1.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.5;0;0.5" dur="1.2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {/* Machine name */}
                      <text x={mx + 16} y={my + mh * 0.3} dominantBaseline="central" fontSize="5.5" fontWeight="700" fill="#333" fontFamily="Inter, sans-serif">
                        {displayName}
                      </text>
                      {/* Type + hours */}
                      <text x={mx + 9} y={my + mh * 0.7} dominantBaseline="central" fontSize="4.5" fill="#666" fontFamily="Inter, sans-serif">
                        {m.type.toUpperCase()} \u2022 {m.operationalHours?.toLocaleString()}hrs
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* (compass moved to HTML overlay below) */}
      </svg>

      {/* ── HUD Overlays ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur-md border border-border px-5 py-2 rounded-full shadow-lg flex items-center space-x-4">
          <Activity className="w-4 h-4 text-text-primary" />
          <span className="font-semibold text-sm text-text-primary tracking-wide">{plantHierarchy.name}</span>
          <div className="w-px h-4 bg-border" />
          <span className="text-xs text-text-secondary">{zoomLabel}</span>
          <Badge variant="healthy">LIVE</Badge>
        </motion.div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-20 right-4 flex flex-col space-y-1 z-10">
        <button onClick={() => zoomBy(0.65)} className="w-9 h-9 bg-card/90 backdrop-blur border border-border rounded-lg flex items-center justify-center hover:bg-border/50 transition-colors">
          <ZoomIn className="w-4 h-4 text-text-primary" />
        </button>
        <button onClick={() => zoomBy(1.5)} className="w-9 h-9 bg-card/90 backdrop-blur border border-border rounded-lg flex items-center justify-center hover:bg-border/50 transition-colors">
          <ZoomOut className="w-4 h-4 text-text-primary" />
        </button>
        <button onClick={resetView} className="w-9 h-9 bg-card/90 backdrop-blur border border-border rounded-lg flex items-center justify-center hover:bg-border/50 transition-colors">
          <Maximize2 className="w-4 h-4 text-text-primary" />
        </button>
      </div>

      {/* Compass — fixed overlay, right side below zoom controls */}
      <div className="absolute top-[220px] right-4 z-10 pointer-events-none">
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl p-2 shadow-lg">
          <svg width="52" height="52" viewBox="-28 -28 56 56">
            {/* Outer ring */}
            <circle r="24" fill="#0d1117" opacity="0.6" />
            <circle r="24" fill="none" stroke="#444" strokeWidth="1" />
            {/* Tick marks */}
            <line x1="0" y1="-24" x2="0" y2="-20" stroke="#666" strokeWidth="1" />
            <line x1="0" y1="20" x2="0" y2="24" stroke="#666" strokeWidth="1" />
            <line x1="-24" y1="0" x2="-20" y2="0" stroke="#666" strokeWidth="1" />
            <line x1="20" y1="0" x2="24" y2="0" stroke="#666" strokeWidth="1" />
            {/* North arrow (red) */}
            <polygon points="0,-19 -5,-4 0,-8 5,-4" fill="#e74c3c" />
            {/* South arrow (grey) */}
            <polygon points="0,19 -5,4 0,8 5,4" fill="#555" />
            {/* Center dot */}
            <circle r="2" fill="#888" />
            {/* Labels */}
            <text y="-21" textAnchor="middle" dominantBaseline="auto" fontSize="6" fontWeight="bold" fill="#e74c3c" fontFamily="Inter, sans-serif">N</text>
            <text y="25" textAnchor="middle" dominantBaseline="hanging" fontSize="5" fill="#777" fontFamily="Inter, sans-serif">S</text>
            <text x="-25" y="1" textAnchor="end" dominantBaseline="central" fontSize="5" fill="#777" fontFamily="Inter, sans-serif">W</text>
            <text x="25" y="1" textAnchor="start" dominantBaseline="central" fontSize="5" fill="#777" fontFamily="Inter, sans-serif">E</text>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div className="bg-card/80 backdrop-blur border border-border px-4 py-2 rounded-full flex items-center space-x-4 text-[10px]">
          {[{ c: 'bg-status-healthy', l: 'Healthy' }, { c: 'bg-status-warning', l: 'Warning' }, { c: 'bg-status-critical animate-pulse', l: 'Critical' }].map(s => (
            <div key={s.l} className="flex items-center space-x-1.5"><div className={`w-2 h-2 rounded-full ${s.c}`} /><span className="text-text-secondary">{s.l}</span></div>
          ))}
          <div className="w-px h-3 bg-border" />
          <span className="text-text-secondary">Scroll to zoom • Drag to pan • Click zone</span>
        </div>
      </div>
    </div>
  );
}

export function PlantMap() {
  return <PlantMapInner />;
}
