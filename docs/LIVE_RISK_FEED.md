## Live Risk Feed Server

The mobile app expects a WebSocket endpoint at `/ws/live` that streams doctor alert cards. Until now that endpoint did not exist which left the doctor dashboard empty. The new `server/live-risk-feed.js` script emulates the scoring service so you can exercise the UI without a backend.

### Running the feed

```bash
# from the repo root
npm run start:risk-feed
```

By default the server listens on `ws://localhost:8088/ws/live`. Update `WS_BASE` (see `.env.example`) if you want to expose it elsewhere:

```env
WS_BASE=ws://192.168.1.10:8088
RISK_FEED_PORT=8088          # optional
RISK_FEED_INTERVAL_MS=6000   # optional broadcast interval override
```

### What it does

- Uses the `ws` package to host a WebSocket endpoint on `/ws/live`
- Broadcasts a synthesized risk event every few seconds for a set of mock patients
- Flags risk level heuristically based on generated vitals (heart rate, blood pressure, SpO₂)
- Sends messages immediately on connection and continues until the socket closes

The payload structure matches `RiskFeedItem` so `useLiveRiskFeed` ingests it without further changes:

```json
{
  "patientId": "P002",
  "patientName": "Meera Patel",
  "risk": "HIGH",
  "message": "Critical vitals spike detected",
  "trigger": {
    "heartRate": 138,
    "spo2": 89,
    "systolic": 152,
    "diastolic": 94
  },
  "receivedAt": "2025-01-24T10:31:00.120Z"
}
```

You can adjust the mock patients or heuristics inside `server/live-risk-feed.js` to suit your testing scenarios. When you build the real scoring service, just host the same `/ws/live` endpoint and the mobile code will continue to work.
