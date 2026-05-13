// =============================================================================
// PlantMap.jsx — Google Maps Style Zoomable Industrial Interface (Feature 2)
// =============================================================================
// Built with React Flow (@xyflow/react)
//
// Zoom levels:
//   High zoom-out  → Plant overview with zone summaries
//   Medium zoom    → Zones expand, machines visible with status
//   Deep zoom      → Sensors, telemetry data, alarm indicators on nodes
//
// Node states: Green (healthy), Amber (warning), Red (critical)
//
// Interactions:
//   Click node → updates side panel, highlights related alarms, syncs feed
//   Hover → contextual info
//   Smooth zooming with pulse animations on critical nodes
// =============================================================================

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAlarmContext } from '../../context/AlarmContext';
import { Badge } from '../ui/Badge';
import {
  Activity,
  Server,
  Thermometer,
  Gauge,
  Wind,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Status helpers ─────────────────────────────────────────────────────────

const statusColor = {
  critical: { border: 'border-status-critical', bg: 'bg-status-critical', glow: 'shadow-[0_0_20px_rgba(255,77,79,0.25)]' },
  warning: { border: 'border-status-warning', bg: 'bg-status-warning', glow: 'shadow-[0_0_12px_rgba(255,176,32,0.15)]' },
  healthy: { border: 'border-status-healthy', bg: 'bg-status-healthy', glow: '' },
};

const sensorIcons = {
  temperature: Thermometer,
  pressure: Gauge,
  vibration: Activity,
  flow: Wind,
  speed: Zap,
  voltage: Zap,
  torque: Gauge,
};

const sensorUnits = {
  temperature: '°C',
  pressure: 'PSI',
  vibration: 'mm/s',
  flow: 'L/min',
  speed: 'RPM',
  voltage: 'V',
  torque: 'Nm',
};

// ─── Custom Node: Zone ──────────────────────────────────────────────────────

function ZoneNode({ data }) {
  const sc = statusColor[data.status] || statusColor.healthy;
  return (
    <div className="pointer-events-none select-none">
      <div className="flex items-center space-x-2 mb-2">
        <Server className="w-4 h-4 text-text-secondary" />
        <span className="text-sm font-semibold text-text-secondary tracking-wide uppercase">
          {data.label}
        </span>
        <div className={`w-2 h-2 rounded-full ${sc.bg}`} />
      </div>
      <div className="text-[10px] text-text-secondary/60">
        {data.machineCount} machines &bull; {data.status}
      </div>
    </div>
  );
}

// ─── Custom Node: Machine ───────────────────────────────────────────────────

function MachineNode({ data, selected }) {
  const sc = statusColor[data.status] || statusColor.healthy;
  const isCritical = data.status === 'critical';
  const alarmCount = data.alarmCount || 0;

  return (
    <div
      className={`relative px-4 py-3 rounded-lg bg-card border-2 transition-all duration-200 min-w-[200px] ${
        selected
          ? 'border-status-selected shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-status-selected/20'
          : `${sc.border} ${sc.glow}`
      }`}
    >
      {/* Status dot with pulse */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${sc.bg}`} />
            {isCritical && (
              <div className={`absolute inset-0 w-3 h-3 rounded-full ${sc.bg} animate-ping opacity-50`} />
            )}
          </div>
          <span className="text-sm font-semibold text-text-primary">{data.label}</span>
        </div>
        {alarmCount > 0 && (
          <div className="flex items-center space-x-1 bg-status-critical/10 text-status-critical px-1.5 py-0.5 rounded text-[10px] font-bold">
            <AlertTriangle className="w-3 h-3" />
            <span>{alarmCount}</span>
          </div>
        )}
      </div>

      {/* Type label */}
      <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">{data.type}</div>

      {/* Sensor grid — visible at deeper zoom */}
      {data.showSensors && data.sensors && (
        <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-border/50">
          {Object.entries(data.sensors).map(([key, value]) => {
            const Icon = sensorIcons[key] || Activity;
            const unit = sensorUnits[key] || '';
            return (
              <div
                key={key}
                className="flex items-center space-x-1.5 text-[10px] text-text-secondary bg-background/50 rounded px-1.5 py-1"
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="text-text-primary font-medium">
                  {value}
                  {unit}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Operational hours */}
      {data.showSensors && data.operationalHours && (
        <div className="text-[9px] text-text-secondary mt-2 flex items-center">
          <Radio className="w-3 h-3 mr-1" />
          {data.operationalHours.toLocaleString()} hrs operational
        </div>
      )}
    </div>
  );
}

// ─── Custom Node: Sensor (visible at deep zoom) ────────────────────────────

function SensorNode({ data }) {
  const Icon = sensorIcons[data.sensorType] || Activity;
  const unit = sensorUnits[data.sensorType] || '';
  const isAnomaly = data.anomaly;

  return (
    <div
      className={`px-3 py-2 rounded-md border text-[11px] transition-all ${
        isAnomaly
          ? 'bg-status-critical/10 border-status-critical/30 text-status-critical'
          : 'bg-card border-border text-text-secondary'
      }`}
    >
      <div className="flex items-center space-x-1.5">
        <Icon className="w-3.5 h-3.5" />
        <span className="font-medium">{data.sensorType}</span>
      </div>
      <div className="text-lg font-bold text-text-primary mt-0.5">
        {data.value}
        <span className="text-[10px] font-normal text-text-secondary ml-0.5">{unit}</span>
      </div>
    </div>
  );
}

// ─── Node types registry ────────────────────────────────────────────────────

const nodeTypes = {
  zone: ZoneNode,
  machine: MachineNode,
  sensor: SensorNode,
};

// ─── Edge styling ───────────────────────────────────────────────────────────

const defaultEdgeOptions = {
  style: { stroke: '#262C36', strokeWidth: 1.5 },
  type: 'smoothstep',
  animated: false,
};

// ─── Inner Map (needs ReactFlowProvider ancestor) ───────────────────────────

function PlantMapInner() {
  const { selectMachine, selectedMachineId, activeAlarms, allMachines, plantHierarchy } =
    useAlarmContext();
  const [zoomLevel, setZoomLevel] = useState('medium');
  const reactFlowInstance = useReactFlow();

  // Build alarm count map
  const alarmCountMap = useMemo(() => {
    const map = {};
    activeAlarms.forEach((a) => {
      map[a.machineId] = (map[a.machineId] || 0) + 1;
    });
    return map;
  }, [activeAlarms]);

  // Build nodes & edges from hierarchy
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const showSensors = true; // always include in data, visibility controlled by zoom

    // Zone nodes
    const zonePositions = [
      { x: 0, y: 0 },
      { x: 550, y: 0 },
      { x: 275, y: 500 },
    ];

    plantHierarchy.zones.forEach((zone, zIndex) => {
      const zp = zonePositions[zIndex] || { x: zIndex * 550, y: 0 };
      const zoneNodeId = zone.id;

      nodes.push({
        id: zoneNodeId,
        type: 'zone',
        data: {
          label: zone.name,
          status: zone.status,
          machineCount: zone.machines.length,
        },
        position: { x: zp.x, y: zp.y },
        draggable: false,
        selectable: false,
      });

      // Machine nodes under each zone
      const cols = 2;
      zone.machines.forEach((machine, mIndex) => {
        const col = mIndex % cols;
        const row = Math.floor(mIndex / cols);
        const mx = zp.x + col * 240 + 20;
        const my = zp.y + 60 + row * 180;

        nodes.push({
          id: machine.id,
          type: 'machine',
          data: {
            label: machine.name,
            status: machine.status,
            type: machine.type,
            sensors: machine.sensors,
            operationalHours: machine.operationalHours,
            alarmCount: alarmCountMap[machine.id] || 0,
            showSensors: false, // toggled by zoom
          },
          position: { x: mx, y: my },
        });

        // Edge: zone → machine
        edges.push({
          id: `e-${zoneNodeId}-${machine.id}`,
          source: zoneNodeId,
          target: machine.id,
          style: {
            stroke: statusColor[machine.status]
              ? machine.status === 'critical'
                ? '#FF4D4F'
                : machine.status === 'warning'
                ? '#FFB020'
                : '#262C36'
              : '#262C36',
            strokeWidth: machine.status === 'critical' ? 2 : 1.5,
            strokeDasharray: machine.status === 'healthy' ? '0' : '5 3',
          },
          type: 'smoothstep',
          animated: machine.status === 'critical',
        });
      });
    });

    // Cross-zone edges for related alarms (show causal relationships)
    // pump_1 → valve_1 (cooling pump affected by valve)
    edges.push({
      id: 'e-valve_1-pump_1',
      source: 'valve_1',
      target: 'pump_1',
      label: 'flow dependency',
      labelStyle: { fill: '#8B93A1', fontSize: 9 },
      style: { stroke: '#FF4D4F', strokeWidth: 2, strokeDasharray: '8 4' },
      type: 'smoothstep',
      animated: true,
    });
    // pump_1 → chiller_1 (chiller compensating)
    edges.push({
      id: 'e-pump_1-chiller_1',
      source: 'pump_1',
      target: 'chiller_1',
      label: 'compensation',
      labelStyle: { fill: '#8B93A1', fontSize: 9 },
      style: { stroke: '#FFB020', strokeWidth: 1.5, strokeDasharray: '6 3' },
      type: 'smoothstep',
      animated: true,
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [alarmCountMap, plantHierarchy]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync selection state with nodes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: node.type === 'machine' && node.id === selectedMachineId,
      }))
    );
  }, [selectedMachineId, setNodes]);

  // Semantic zoom: toggle sensor visibility based on zoom level
  const onMoveEnd = useCallback(
    (_, viewport) => {
      const zoom = viewport.zoom;
      let level = 'high';
      if (zoom >= 0.8) level = 'deep';
      else if (zoom >= 0.5) level = 'medium';

      setZoomLevel(level);

      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'machine') {
            return {
              ...node,
              data: {
                ...node.data,
                showSensors: zoom >= 0.8,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const onNodeClick = useCallback(
    (_event, node) => {
      if (node.type === 'machine') {
        selectMachine(node.id);
      }
    },
    [selectMachine]
  );

  const onPaneClick = useCallback(() => {
    selectMachine(null);
  }, [selectMachine]);

  // Zoom level indicator label
  const zoomLabel = zoomLevel === 'deep' ? 'Sensor Level' : zoomLevel === 'medium' ? 'Machine Level' : 'Plant Overview';

  return (
    <div className="w-full h-full bg-background absolute inset-0 z-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.15}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#262C36" gap={24} size={1} variant="dots" />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* Top HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-md border border-border px-5 py-2 rounded-full shadow-lg flex items-center space-x-4"
        >
          <Activity className="w-4 h-4 text-text-primary" />
          <span className="font-semibold text-sm text-text-primary tracking-wide">
            {plantHierarchy.name}
          </span>
          <div className="w-px h-4 bg-border" />
          <span className="text-xs text-text-secondary">{zoomLabel}</span>
          <Badge variant="healthy">LIVE</Badge>
        </motion.div>
      </div>

      {/* Bottom legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <div className="bg-card/70 backdrop-blur border border-border px-4 py-2 rounded-full flex items-center space-x-4 text-[10px]">
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-status-healthy" />
            <span className="text-text-secondary">Healthy</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-status-warning" />
            <span className="text-text-secondary">Warning</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2 h-2 rounded-full bg-status-critical animate-pulse" />
            <span className="text-text-secondary">Critical</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center space-x-1.5">
            <div className="w-4 h-0 border-t border-dashed border-status-critical" />
            <span className="text-text-secondary">Dependency</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Exported wrapper with ReactFlowProvider ────────────────────────────────

export function PlantMap() {
  return (
    <ReactFlowProvider>
      <PlantMapInner />
    </ReactFlowProvider>
  );
}
