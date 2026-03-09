const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  const method = event.httpMethod;
  const path = event.path || event.rawPath;

  try {
    // GET /dashboard
    if (path === '/api/dashboard' && method === 'GET') {
      const dashboard = await getDashboard();
      return response(200, dashboard);
    }

    // GET /alerts
    if (path === '/api/alerts' && method === 'GET') {
      const alerts = await getAlerts();
      return response(200, { alerts });
    }

    // DELETE /alerts/:id
    if (path.match(/^\/api\/alerts\/[^/]+$/) && method === 'DELETE') {
      const alertId = path.split('/').pop();
      await dismissAlert(alertId);
      return response(204, {});
    }

    // POST /test-leak
    if (path === '/api/test-leak' && method === 'POST') {
      const result = await createTestAlert();
      return response(200, result);
    }

    if (method === 'OPTIONS') return response(200, {});

    return response(404, { error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: error.message });
  }
};

async function getDashboard() {
  try {
    const alertsRes = await dynamodb.scan({
      TableName: process.env.ALERTS_TABLE || 'water-consumption-alerts'
    }).promise();

    return {
      totalConsumption: 1250.5,
      dailyAverage: 185.3,
      consumptionGrowth: 12.5,
      activeAlerts: alertsRes.Items?.length || 0,
      leakRisk: 45,
      buildingLevel: {
        totalUsage: 4850,
        flatCount: 26
      },
      conservationTarget: 3000,
      consumptionTrend: generateTrendData(),
      leakCandidates: generateLeakCandidates()
    };
  } catch (error) {
    console.error('getDashboard error:', error);
    throw error;
  }
}

async function getAlerts() {
  try {
    const result = await dynamodb.scan({
      TableName: process.env.ALERTS_TABLE || 'water-consumption-alerts'
    }).promise();

    return result.Items || [];
  } catch (error) {
    console.error('getAlerts error:', error);
    return [];
  }
}

async function dismissAlert(alertId) {
  try {
    await dynamodb.delete({
      TableName: process.env.ALERTS_TABLE || 'water-consumption-alerts',
      Key: { id: alertId }
    }).promise();
  } catch (error) {
    console.error('dismissAlert error:', error);
    throw error;
  }
}

async function createTestAlert() {
  const alertId = uuidv4();
  const flatId = `FLAT-${Math.floor(Math.random() * 100)}`;
  
  const alert = {
    id: alertId,
    flatId,
    consumption: 85,
    baseline: 25,
    message: `High water consumption detected at ${flatId}`,
    timestamp: new Date().toISOString(),
    severity: 'high'
  };

  try {
    await dynamodb.put({
      TableName: process.env.ALERTS_TABLE || 'water-consumption-alerts',
      Item: alert
    }).promise();
  } catch (error) {
    console.error('createTestAlert error:', error);
  }

  return { success: true, alert };
}

function generateTrendData() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    totalUsage: Math.floor(Math.random() * 150 + 80),
    commonAreas: Math.floor(Math.random() * 50 + 20),
    residentialAvg: Math.floor(Math.random() * 100 + 60)
  }));
}

function generateLeakCandidates() {
  return [
    {
      flatId: 'FLAT-42',
      nightFlow: 88.5,
      baseline: 15.2,
      risk: 482,
      reason: 'Excessive night-time flow detected'
    },
    {
      flatId: 'FLAT-15',
      nightFlow: 65.3,
      baseline: 18.9,
      risk: 245,
      reason: 'Continuous low flow during night hours'
    }
  ];
}
