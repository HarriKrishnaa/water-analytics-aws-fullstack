# API Reference - Water Analytics System

## Base URL
```
https://your-api-gateway-domain.com
```

## Authentication
All API requests require CORS headers to be properly configured. The API is protected by AWS Lambda function execution roles.

## Endpoints

### 1. Get Dashboard Metrics

**Endpoint:** `GET /api/dashboard`

**Description:** Retrieves current water consumption metrics and overall dashboard statistics.

**Headers:**
```
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalConsumption": 1250.5,
    "averageDailyConsumption": 156.3,
    "activeAlerts": 3,
    "leakRiskScore": 45,
    "lastUpdated": "2024-01-15T14:30:00Z",
    "flatData": [
      {
        "flatId": "FLAT-1",
        "consumption": 125.5,
        "timestamp": "2024-01-15T14:00:00Z",
        "riskLevel": "normal"
      },
      {
        "flatId": "FLAT-2",
        "consumption": 189.3,
        "timestamp": "2024-01-15T14:00:00Z",
        "riskLevel": "high"
      }
    ]
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

---

### 2. Get Recent Alerts

**Endpoint:** `GET /api/alerts`

**Description:** Retrieves recent water consumption alerts and anomalies detected.

**Query Parameters:**
- `limit` (optional): Number of alerts to return (default: 10, max: 100)
- `status` (optional): Filter by status - 'active', 'resolved', 'all' (default: 'all')
- `flatId` (optional): Filter alerts for specific flat ID

**Example Request:**
```
GET /api/alerts?limit=20&status=active
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "alertId": "alert-001",
        "flatId": "FLAT-15",
        "timestamp": "2024-01-15T03:00:00Z",
        "message": "Excessive night-time water consumption detected",
        "consumption": 450.2,
        "baseline": 75.5,
        "riskLevel": "critical",
        "status": "active",
        "emailSent": true,
        "leakProbability": 0.92
      },
      {
        "alertId": "alert-002",
        "flatId": "FLAT-8",
        "timestamp": "2024-01-14T15:30:00Z",
        "message": "Unusual consumption pattern detected",
        "consumption": 235.7,
        "baseline": 120.3,
        "riskLevel": "high",
        "status": "resolved",
        "emailSent": true,
        "leakProbability": 0.68
      }
    ],
    "totalCount": 45,
    "activeCount": 8
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

---

### 3. Trigger Anomaly Detection

**Endpoint:** `POST /api/anomaly-detection`

**Description:** Manually trigger anomaly detection algorithm for water consumption data.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "dateRange": "24h",
  "sensitivity": "medium",
  "includeHistorical": true
}
```

**Parameters:**
- `dateRange`: Time range for analysis - '24h', '7d', '30d' (default: '24h')
- `sensitivity`: Detection sensitivity - 'low', 'medium', 'high' (default: 'medium')
- `includeHistorical`: Include historical data in analysis (default: false)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis-2024-01-15-001",
    "anomaliesDetected": 3,
    "highRiskFlats": ["FLAT-15", "FLAT-8"],
    "estimatedLeakLocations": [
      {
        "location": "Common area - 3rd floor",
        "confidence": 0.87,
        "affectedFlats": ["FLAT-15", "FLAT-14"]
      }
    ],
    "processingTime": 2.35,
    "timestamp": "2024-01-15T15:45:00Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Invalid parameters provided",
  "details": "sensitivity must be one of: low, medium, high"
}
```

---

### 4. Get Consumption Trends

**Endpoint:** `GET /api/trends`

**Description:** Retrieves consumption trends for analysis and visualization.

**Query Parameters:**
- `period` (required): 'daily', 'weekly', 'monthly'
- `flatId` (optional): Specific flat ID, or 'all' for building-wide data
- `days` (optional): Number of days to include (default: 30)

**Example Request:**
```
GET /api/trends?period=daily&flatId=FLAT-5&days=7
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": "daily",
    "flatId": "FLAT-5",
    "trends": [
      {
        "date": "2024-01-08",
        "consumption": 145.2,
        "baseline": 150.0,
        "anomaly": false
      },
      {
        "date": "2024-01-09",
        "consumption": 152.3,
        "baseline": 150.0,
        "anomaly": false
      },
      {
        "date": "2024-01-10",
        "consumption": 385.7,
        "baseline": 150.0,
        "anomaly": true
      }
    ],
    "averageConsumption": 156.3,
    "minConsumption": 120.5,
    "maxConsumption": 450.2
  }
}
```

---

## Error Handling

All errors follow this standard format:

```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE",
  "statusCode": 400
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_REQUEST | 400 | Invalid request parameters |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| TIMEOUT | 504 | Request timeout |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

API requests are rate-limited:
- **Free tier**: 100 requests/minute
- **Standard tier**: 1000 requests/minute
- **Premium tier**: Unlimited

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705343400
```

---

## CORS Policy

The API supports Cross-Origin requests from registered domains:

```
Access-Control-Allow-Origin: https://water-analytics-xxxx.vercel.app
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

---

## Example cURL Requests

### Get Dashboard
```bash
curl -X GET "https://api.wateranalytics.com/api/dashboard" \
  -H "Content-Type: application/json"
```

### Get Recent Alerts
```bash
curl -X GET "https://api.wateranalytics.com/api/alerts?limit=10&status=active" \
  -H "Content-Type: application/json"
```

### Trigger Anomaly Detection
```bash
curl -X POST "https://api.wateranalytics.com/api/anomaly-detection" \
  -H "Content-Type: application/json" \
  -d '{
    "dateRange": "24h",
    "sensitivity": "high",
    "includeHistorical": true
  }'
```

### Get Trends
```bash
curl -X GET "https://api.wateranalytics.com/api/trends?period=daily&flatId=FLAT-1&days=7" \
  -H "Content-Type: application/json"
```

---

## Testing

### Using Postman

1. Import the API Reference into Postman
2. Set environment variable: `BASE_URL=https://your-api-gateway.com`
3. Run requests from the Collections

### Using JavaScript Fetch

```javascript
const fetchAlerts = async () => {
  const response = await fetch('https://api.wateranalytics.com/api/alerts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log(data);
};
```

---

## Support

For API support:
- Check [README.md](./README.md) for general documentation
- Review [SETUP_GUIDE.md](./SETUP_GUIDE.md) for configuration
- Check [DEPLOYMENT_GUIDE.md](./frontend/DEPLOYMENT_GUIDE.md) for deployment issues
- Submit GitHub Issues for bugs and feature requests
