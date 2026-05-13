// =============================================================================
// mockData.js — Shared industrial mock data for all three teammates
// =============================================================================
// Hierarchy: Plant → Zones → Machines → Sensors
// Includes: timestamps, severity, linked incidents, AI summaries, operational states
// =============================================================================

const now = Date.now();
const min = (m) => 1000 * 60 * m;
const hr = (h) => 1000 * 60 * 60 * h;

// ---------------------------------------------------------------------------
// PLANT HIERARCHY
// ---------------------------------------------------------------------------
export const plantHierarchy = {
  id: 'plant_1',
  name: 'Gigafactory Alpha',
  type: 'plant',
  location: 'Bay Area Industrial Complex, Building 7',
  status: 'critical',
  uptime: 99.97,
  zones: [
    {
      id: 'zone_power',
      name: 'Power Generation',
      status: 'warning',
      machines: [
        {
          id: 'turb_1',
          name: 'Gas Turbine A',
          type: 'turbine',
          status: 'healthy',
          operationalHours: 12480,
          lastMaintenance: '2026-04-28',
          sensors: { temperature: 420, vibration: 1.2, speed: 3600, pressure: 210 },
        },
        {
          id: 'turb_2',
          name: 'Gas Turbine B',
          type: 'turbine',
          status: 'healthy',
          operationalHours: 11200,
          lastMaintenance: '2026-05-01',
          sensors: { temperature: 415, vibration: 1.1, speed: 3580, pressure: 208 },
        },
        {
          id: 'comp_1',
          name: 'Primary Compressor',
          type: 'compressor',
          status: 'warning',
          operationalHours: 8760,
          lastMaintenance: '2026-04-15',
          sensors: { pressure: 110, temperature: 85, flow: 450, vibration: 2.9 },
        },
        {
          id: 'gen_1',
          name: 'Generator Unit 1',
          type: 'generator',
          status: 'healthy',
          operationalHours: 14200,
          lastMaintenance: '2026-05-05',
          sensors: { temperature: 72, vibration: 0.4, speed: 1800, voltage: 480 },
        },
      ],
    },
    {
      id: 'zone_cooling',
      name: 'Cooling Systems',
      status: 'critical',
      machines: [
        {
          id: 'pump_1',
          name: 'Cooling Pump Alpha',
          type: 'pump',
          status: 'critical',
          operationalHours: 9100,
          lastMaintenance: '2026-04-10',
          sensors: { vibration: 4.8, pressure: 45, temperature: 95, flow: 280 },
        },
        {
          id: 'pump_2',
          name: 'Cooling Pump Beta',
          type: 'pump',
          status: 'healthy',
          operationalHours: 8900,
          lastMaintenance: '2026-05-02',
          sensors: { vibration: 0.8, pressure: 120, temperature: 45, flow: 520 },
        },
        {
          id: 'chiller_1',
          name: 'Chiller Unit A',
          type: 'chiller',
          status: 'warning',
          operationalHours: 6700,
          lastMaintenance: '2026-04-20',
          sensors: { temperature: 12, pressure: 85, flow: 340, vibration: 1.6 },
        },
        {
          id: 'valve_1',
          name: 'Intake Valve V-12',
          type: 'valve',
          status: 'critical',
          operationalHours: 9100,
          lastMaintenance: '2026-04-10',
          sensors: { pressure: 38, temperature: 88, flow: 120 },
        },
      ],
    },
    {
      id: 'zone_assembly',
      name: 'Assembly Line',
      status: 'healthy',
      machines: [
        {
          id: 'robot_1',
          name: 'Robotic Arm R-01',
          type: 'robot',
          status: 'healthy',
          operationalHours: 5200,
          lastMaintenance: '2026-05-08',
          sensors: { temperature: 38, vibration: 0.3, speed: 120, torque: 45 },
        },
        {
          id: 'robot_2',
          name: 'Robotic Arm R-02',
          type: 'robot',
          status: 'healthy',
          operationalHours: 5100,
          lastMaintenance: '2026-05-08',
          sensors: { temperature: 37, vibration: 0.2, speed: 118, torque: 44 },
        },
        {
          id: 'conv_1',
          name: 'Conveyor Belt C-1',
          type: 'conveyor',
          status: 'warning',
          operationalHours: 7800,
          lastMaintenance: '2026-04-25',
          sensors: { speed: 2.4, temperature: 42, vibration: 1.8 },
        },
        {
          id: 'press_1',
          name: 'Hydraulic Press HP-3',
          type: 'press',
          status: 'healthy',
          operationalHours: 6100,
          lastMaintenance: '2026-05-06',
          sensors: { pressure: 3200, temperature: 55, vibration: 0.6 },
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// INITIAL ALARMS — rich, threaded, with AI summaries
// ---------------------------------------------------------------------------
export const initialAlarms = [
  // ── CRITICAL INCIDENT 1: Cooling Pump Cascade Failure ───────────────────
  {
    id: 'ALM-1042',
    machineId: 'pump_1',
    machineName: 'Cooling Pump Alpha',
    location: 'Cooling Systems',
    severity: 'critical',
    pinned: true,
    timestamp: new Date(now - min(3)).toISOString(),
    title: 'Critical Vibration Anomaly — Cascade Risk',
    summary:
      'Cooling Pump Alpha vibration exceeded 4.5 mm/s threshold, causing pressure instability across 4 connected sensors in the cooling loop. Root cause analysis suggests worn bearing on impeller shaft. Recommended immediate inspection: intake valve V-12 and coolant circulation path.',
    status: 'active',
    relatedAlarms: [
      {
        id: 'ALM-1043',
        machineId: 'pump_1',
        title: 'Pressure Drop — Intake Line',
        severity: 'warning',
        timestamp: new Date(now - min(2)).toISOString(),
        summary: 'Intake pressure dropped to 45 PSI (threshold: 80 PSI).',
      },
      {
        id: 'ALM-1044',
        machineId: 'valve_1',
        title: 'Intake Valve V-12 Flow Restriction',
        severity: 'critical',
        timestamp: new Date(now - min(2)).toISOString(),
        summary: 'Flow rate at V-12 reduced to 120 L/min, 54% below nominal.',
      },
      {
        id: 'ALM-1045',
        machineId: 'pump_1',
        title: 'Coolant Temperature Elevation',
        severity: 'warning',
        timestamp: new Date(now - min(1)).toISOString(),
        summary: 'Outlet temp 95°C — approaching thermal shutdown at 105°C.',
      },
      {
        id: 'ALM-1046',
        machineId: 'chiller_1',
        title: 'Chiller A — Compensation Load Spike',
        severity: 'warning',
        timestamp: new Date(now - min(1)).toISOString(),
        summary: 'Chiller running at 118% capacity to compensate for pump degradation.',
      },
    ],
  },
  // ── WARNING INCIDENT 2: Compressor Pressure ─────────────────────────────
  {
    id: 'ALM-0988',
    machineId: 'comp_1',
    machineName: 'Primary Compressor',
    location: 'Power Generation',
    severity: 'warning',
    pinned: false,
    timestamp: new Date(now - min(45)).toISOString(),
    title: 'Pressure Output Fluctuations',
    summary:
      'Output pressure fluctuating ±5% from 110 PSI baseline. Bearing temperature remains nominal at 85°C. Pattern correlates with upstream gas supply irregularity. Recommend monitoring for 2 hours before maintenance escalation.',
    status: 'active',
    relatedAlarms: [
      {
        id: 'ALM-0989',
        machineId: 'comp_1',
        title: 'Vibration Increase — Stage 2 Impeller',
        severity: 'warning',
        timestamp: new Date(now - min(40)).toISOString(),
        summary: 'Vibration at 2.9 mm/s, trending upward from 1.8 mm/s baseline.',
      },
    ],
  },
  // ── WARNING INCIDENT 3: Conveyor ────────────────────────────────────────
  {
    id: 'ALM-0950',
    machineId: 'conv_1',
    machineName: 'Conveyor Belt C-1',
    location: 'Assembly Line',
    severity: 'warning',
    pinned: false,
    timestamp: new Date(now - hr(1.5)).toISOString(),
    title: 'Belt Tracking Deviation',
    summary:
      'Conveyor belt drifting 12mm from center track. Vibration sensors indicate potential roller misalignment. No production impact yet, but risk of material spillage at current rate.',
    status: 'active',
    relatedAlarms: [
      {
        id: 'ALM-0951',
        machineId: 'conv_1',
        title: 'Motor Temperature Rise',
        severity: 'warning',
        timestamp: new Date(now - hr(1.2)).toISOString(),
        summary: 'Drive motor temp at 42°C, 8°C above normal operating range.',
      },
    ],
  },
  // ── HEALTHY NOTICE 4: Turbine ───────────────────────────────────────────
  {
    id: 'ALM-0910',
    machineId: 'turb_1',
    machineName: 'Gas Turbine A',
    location: 'Power Generation',
    severity: 'info',
    pinned: false,
    timestamp: new Date(now - hr(3)).toISOString(),
    title: 'Scheduled Maintenance Reminder',
    summary:
      'Gas Turbine A approaching 12,500 operational hours. Next scheduled maintenance window: 2026-05-18. All parameters nominal.',
    status: 'active',
    relatedAlarms: [],
  },
  // ── CRITICAL INCIDENT 5: Valve ──────────────────────────────────────────
  {
    id: 'ALM-1050',
    machineId: 'valve_1',
    machineName: 'Intake Valve V-12',
    location: 'Cooling Systems',
    severity: 'critical',
    pinned: true,
    timestamp: new Date(now - min(8)).toISOString(),
    title: 'Valve Actuator Failure — Manual Override Required',
    summary:
      'Electronic actuator on Intake Valve V-12 is unresponsive. Valve stuck at 35% open position. Manual override required. This is contributing to downstream flow restriction affecting Cooling Pump Alpha.',
    status: 'active',
    relatedAlarms: [
      {
        id: 'ALM-1051',
        machineId: 'valve_1',
        title: 'Actuator Power Supply Fault',
        severity: 'critical',
        timestamp: new Date(now - min(7)).toISOString(),
        summary: '24V DC supply to actuator reads 0V. Check fuse F-47 in panel CB-12.',
      },
    ],
  },
  // ── WARNING INCIDENT 6: Chiller ─────────────────────────────────────────
  {
    id: 'ALM-0975',
    machineId: 'chiller_1',
    machineName: 'Chiller Unit A',
    location: 'Cooling Systems',
    severity: 'warning',
    pinned: false,
    timestamp: new Date(now - min(25)).toISOString(),
    title: 'Refrigerant Pressure Below Optimal',
    summary:
      'Chiller refrigerant loop pressure at 85 PSI, below the 95 PSI optimal. Potential slow refrigerant leak or expansion valve issue. COP dropping from 4.2 to 3.6.',
    status: 'active',
    relatedAlarms: [],
  },
  // ── WARNING INCIDENT 7: Robot ───────────────────────────────────────────
  {
    id: 'ALM-0930',
    machineId: 'robot_1',
    machineName: 'Robotic Arm R-01',
    location: 'Assembly Line',
    severity: 'warning',
    pinned: false,
    timestamp: new Date(now - hr(2)).toISOString(),
    title: 'Joint 3 Torque Variation',
    summary:
      'Joint 3 torque reading 45 Nm with ±8% variance during pick operations. Calibration drift suspected. Unit remains operational within safety limits.',
    status: 'active',
    relatedAlarms: [],
  },
  // ── HEALTHY NOTICE 8: Press ─────────────────────────────────────────────
  {
    id: 'ALM-0900',
    machineId: 'press_1',
    machineName: 'Hydraulic Press HP-3',
    location: 'Assembly Line',
    severity: 'info',
    pinned: false,
    timestamp: new Date(now - hr(4)).toISOString(),
    title: 'Hydraulic Fluid Level — Approaching Service',
    summary:
      'Hydraulic fluid reservoir at 72%. Service threshold at 60%. Estimated 340 operational hours before top-up required.',
    status: 'active',
    relatedAlarms: [],
  },
];

// ---------------------------------------------------------------------------
// AI GLOBAL SUMMARY — synthesizes all active alarms into a single narrative
// ---------------------------------------------------------------------------
export const aiGlobalSummary = {
  timestamp: new Date(now).toISOString(),
  title: 'AI Operational Summary',
  narrative:
    'Critical cascade event in Cooling Systems: Intake Valve V-12 actuator failure is restricting coolant flow to Cooling Pump Alpha, causing vibration anomaly (4.8 mm/s) and downstream pressure instability across 4 sensors. Chiller Unit A compensating at 118% load with declining COP. Parallel warning on Primary Compressor pressure fluctuations in Power Generation zone — correlated with upstream gas supply irregularity. Assembly Line operating nominally with minor conveyor tracking deviation and robotic arm calibration drift. Recommended priority: 1) Manual override on V-12, 2) Pump Alpha bearing inspection, 3) Compressor monitoring window.',
  affectedZones: ['Cooling Systems', 'Power Generation'],
  criticalCount: 2,
  warningCount: 5,
  totalActive: 8,
};
