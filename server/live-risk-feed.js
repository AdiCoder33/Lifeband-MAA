/* eslint-disable no-console */
const http = require('http');
const {WebSocketServer} = require('ws');

const PORT = Number(process.env.RISK_FEED_PORT ?? 8088);
const BROADCAST_INTERVAL = Number(process.env.RISK_FEED_INTERVAL_MS ?? 8000);

const patients = [
  {id: 'P001', name: 'Anika Sharma', trimester: 'Second'},
  {id: 'P002', name: 'Meera Patel', trimester: 'Third'},
  {id: 'P003', name: 'Sita Verma', trimester: 'First'},
  {id: 'P004', name: 'Nisha Reddy', trimester: 'Second'},
  {id: 'P005', name: 'Latha Kumari', trimester: 'Third'},
];

const riskMessages = {
  HIGH: [
    'Critical vitals spike detected',
    'Sustained hypertension – escalate immediately',
    'Baby heart rate anomalies detected',
  ],
  MODERATE: [
    'Vitals drifting from baseline, review soon',
    'Remind patient to rest and hydrate',
    'Follow up on medication adherence',
  ],
  LOW: [
    'Vitals within healthy range',
    'Stable readings, continue routine monitoring',
  ],
};

const randomFrom = list => list[Math.floor(Math.random() * list.length)];

const calculateRisk = vitals => {
  if (vitals.heartRate > 130 || vitals.systolic > 150 || vitals.spo2 < 90) {
    return 'HIGH';
  }
  if (vitals.heartRate > 110 || vitals.systolic > 135 || vitals.spo2 < 94) {
    return 'MODERATE';
  }
  return 'LOW';
};

const buildVitals = () => ({
  heartRate: Math.floor(70 + Math.random() * 80),
  spo2: Math.floor(90 + Math.random() * 10),
  systolic: Math.floor(110 + Math.random() * 45),
  diastolic: Math.floor(70 + Math.random() * 20),
});

const buildEvent = () => {
  const patient = randomFrom(patients);
  const vitals = buildVitals();
  const risk = calculateRisk(vitals);
  return {
    patientId: patient.id,
    patientName: patient.name,
    trimester: patient.trimester,
    risk,
    message: randomFrom(riskMessages[risk]),
    trigger: vitals,
    receivedAt: new Date().toISOString(),
  };
};

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'ok', connections: wss?.clients?.size ?? 0}));
    return;
  }
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Live risk feed server running.\n');
});

const wss = new WebSocketServer({server, path: '/ws/live'});

wss.on('connection', socket => {
  console.log('[RiskFeed] client connected');
  socket.send(JSON.stringify({type: 'welcome', message: 'Live risk feed connected'}));

  const pushEvent = () => {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(buildEvent()));
    }
  };

  const interval = setInterval(pushEvent, BROADCAST_INTERVAL);
  pushEvent();

  socket.on('close', () => {
    console.log('[RiskFeed] client disconnected');
    clearInterval(interval);
  });
  socket.on('error', error => {
    console.warn('[RiskFeed] socket error', error);
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log(`[RiskFeed] WebSocket feed running on ws://localhost:${PORT}/ws/live`);
});
