# 💧 Water Consumption & Leakage Analytics System

**A complete full-stack solution for apartment building water management using React, Node.js Lambda, and AWS services.**

## 🎯 Project Overview

This system provides real-time monitoring of water consumption across apartment buildings, detecting anomalies and identifying potential leaks through IoT data analysis, stream processing, and machine learning patterns.

### Key Features:
- **Real-time Dashboard** - Live water consumption metrics and alerts
- **Smart Leak Detection** - 3AM baseline detection algorithm
- **Email Alerts** - SMTP-based notifications using 16-char app password
- **AWS Integration** - IoT Core, Kinesis, TimeStream, DynamoDB
- **Data Analytics** - Consumption trends and leak risk scoring
- **Responsive UI** - React with modern charting capabilities

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                          │
│        React Dashboard (S3 + CloudFront)                    │
│  ├─ Dashboard Component                                     │
│  ├─ Alert Panel                                             │
│  ├─ Consumption Charts                                      │
│  └─ Leak Detection Map                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
                      API GATEWAY
                    (REST Endpoints)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                           │
│               AWS Lambda Functions                          │
│  ├─ API Handler (Node.js)                                   │
│  ├─ Kinesis Processor                                       │
│  ├─ 3AM Leak Detector (SMTP Email)                          │
│  └─ IoT Data Ingestion                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER                                │
│  ├─ Kinesis Data Streams (meter readings)                   │
│  ├─ TimeStream (time-series metrics)                        │
│  ├─ DynamoDB (alerts & thresholds)                          │
│  ├─ S3 (archived Parquet files)                             │
│  └─ IoT Core (device management)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
water-analytics-aws-fullstack/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AlertPanel.jsx
│   │   │   ├── ConsumptionChart.jsx
│   │   │   └── LeakDetectionMap.jsx
│   │   ├── hooks/
│   │   │   └── useApi.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── .env.local
│
├── backend/
│   ├── functions/
│   │   ├── api-handler/
│   │   │   ├── index.js
│   │   │   ├── package.json
│   │   │   └── handlers/
│   │   │       ├── dashboard.js
│   │   │       ├── alerts.js
│   │   │       └── utils.js
│   │   ├── leak-detector-3am/
│   │   │   ├── index.js
│   │   │   ├── package.json
│   │   │   └── emailService.js
│   │   ├── kinesis-processor/
│   │   │   ├── index.js
│   │   │   └── package.json
│   │   └── iot-ingestion/
│   │       ├── index.js
│   │       └── package.json
│   ├── template.yaml (SAM)
│   ├── .env.example
│   └── Makefile
│
├── docs/
│   ├── SETUP_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── API_REFERENCE.md
│   └── ARCHITECTURE.md
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 16+ and npm
- AWS Account with CLI configured
- Docker (optional, for local development)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/HarriKrishnaa/water-analytics-aws-fullstack.git
cd water-analytics-aws-fullstack
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:3001/api" > .env.local
echo "VITE_AWS_REGION=us-east-1" >> .env.local

# Start development server
npm run dev
```

### 3. Backend Setup
```bash
cd backend
npm install

# Copy env file
cp .env.example .env

# Install SAM CLI
pip install aws-sam-cli

# Build and deploy functions
sam build
sam deploy --guided
```

---

## 📊 Key Components

### Frontend Components

**Dashboard.jsx** - Displays real-time metrics:
- Total consumption (today)
- Daily average per flat
- Leak risk score
- Active alerts count
- Building-level statistics

**AlertPanel.jsx** - Shows critical alerts:
- Consumption spikes (>3x baseline)
- Alert severity levels
- Dismissible notifications
- Flat identification

**ConsumptionChart.jsx** - 24-hour trend visualization:
- Total usage line
- Common areas vs residential
- Interactive tooltips

**LeakDetectionMap.jsx** - Potential leak candidates:
- Risk scoring algorithm
- Inspection scheduling
- Night-time flow analysis

### Backend Lambda Functions

**api-handler** - REST API endpoints:
```
GET /dashboard       - System overview metrics
GET /alerts         - Active alerts list
DELETE /alerts/:id  - Dismiss alert
POST /test-leak     - Trigger test detection
```

**leak-detector-3am** - Scheduled leak detection:
- Runs daily at 3 AM
- Analyzes nighttime flow (2-4 AM)
- 50L/night threshold trigger
- SMTP email notifications

**kinesis-processor** - Stream data processing:
- Ingests meter readings from Kinesis
- Detects consumption anomalies
- Writes to TimeStream

**iot-ingestion** - IoT Core integration:
- Receives MQTT messages
- Validates and transforms data
- Publishes to Kinesis stream

---

## ⚙️ Configuration

### Environment Variables (backend/.env)
```env
AWS_REGION=us-east-1
TIMESTREAM_DB_NAME=water-metrics
TIMESTREAM_TABLE_NAME=meter-readings
DYNAMODB_TABLE_ALERTS=water-consumption-alerts
DYNAMODB_TABLE_THRESHOLDS=consumption-thresholds

# SMTP Configuration (for 3AM leak detector)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_APP_PASSWORD=your-16-char-app-password
ALERT_EMAIL_FROM=alerts@wateranalytics.com
ALERT_EMAIL_TO=manager@building.com,resident@flat.com
```

### Frontend Environment Variables (frontend/.env.local)
```env
VITE_API_URL=https://your-api-gateway-url/api
VITE_AWS_REGION=us-east-1
```

---

## 📈 3AM Leak Detection Algorithm

### How It Works:

1. **Trigger**: CloudWatch scheduled event (3 AM UTC)
2. **Query**: TimeStream for 2-4 AM readings from last 7 days
3. **Baseline**: Calculate 7-day rolling average
4. **Detection**: Flag flats exceeding 50L/night
5. **Alert**: Send SMTP email to managers & residents
6. **Store**: Log detection in DynamoDB

### Example Detection:
```javascript
// Flat 42 metrics
7-day average:  15L/night
Today's flow:   88L/night
Risk score:     586% (88/15*100)
Status:         CRITICAL ⚠️
```

---

## 🔌 API Reference

### Dashboard Endpoint
```bash
GET /api/dashboard

Response:
{
  "totalConsumption": 1250.5,
  "dailyAverage": 185.3,
  "consumptionGrowth": 12.5,
  "activeAlerts": 3,
  "leakRisk": 45,
  "buildingLevel": {
    "totalUsage": 4850,
    "flatCount": 26
  },
  "consumptionTrend": [
    { "hour": "00:00", "totalUsage": 120, "commonAreas": 40 },
    ...
  ],
  "leakCandidates": [
    {
      "flatId": "FLAT-42",
      "nightFlow": 88.5,
      "baseline": 15.2,
      "risk": 482,
      "reason": "Excessive night-time flow detected"
    }
  ]
}
```

### Alerts Endpoint
```bash
GET /api/alerts

Response:
{
  "alerts": [
    {
      "id": "alert-001",
      "flatId": "FLAT-15",
      "message": "High water consumption detected",
      "consumption": 250,
      "baseline": 75,
      "severity": "high",
      "timestamp": "2026-03-09T21:00:00Z"
    }
  ]
}
```

---

## 🔐 Security Best Practices

- ✅ API Gateway with authorization tokens
- ✅ DynamoDB encryption at rest
- ✅ VPC endpoints for private AWS services
- ✅ IAM roles with least privilege
- ✅ SMTP app passwords (not master password)
- ✅ Environment variables for secrets
- ✅ CORS restrictions on API Gateway

---

## 📚 Documentation

- [Setup Guide](./docs/SETUP_GUIDE.md) - Detailed installation instructions
- [Deployment](./docs/DEPLOYMENT.md) - Production deployment steps
- [API Reference](./docs/API_REFERENCE.md) - Complete API documentation
- [Architecture](./docs/ARCHITECTURE.md) - System design details

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👨‍💻 Author

**Harri Krishnaa**  
Chennai, India  
📧 harrikrishnaa@gmail.com  
🐙 [GitHub](https://github.com/HarriKrishnaa)  

---

## 🙏 Acknowledgments

- AWS Lambda documentation
- React community
- Recharts library
- Node.js ecosystem
