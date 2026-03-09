const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS SDK
const region = process.env.AWS_REGION || 'us-east-1';
const dynamodb = new AWS.DynamoDB.DocumentClient({ region });
const timestream = new AWS.TimestreamQuery({ region });

const ALERTS_TABLE = process.env.DYNAMODB_TABLE || 'alerts';
const TIMESTREAM_DB = process.env.TIMESTREAM_DB || 'water-analytics';
const TIMESTREAM_TABLE = process.env.TIMESTREAM_TABLE || 'meter-readings';

exports.handler = async (event) => {
  const { httpMethod, resource, pathParameters, body } = event;
  
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET /api/dashboard
    if (httpMethod === 'GET' && resource === '/api/dashboard') {
      return await getDashboardData(headers);
    }

    // GET /api/alerts
    if (httpMethod === 'GET' && resource === '/api/alerts') {
      return await getAlerts(headers);
    }

    // DELETE /api/alerts/{id}
    if (httpMethod === 'DELETE' && resource === '/api/alerts/{id}') {
      const alertId = pathParameters.id;
      return await deleteAlert(alertId, headers);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };
  } catch (error) {
    console.error('Lambda Handler Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function getDashboardData(headers) {
  // Query Timestream for last 24h trend
  const query = `
    SELECT bin(time, 1h) as hour, 
           SUM(measure_value::double) as totalUsage,
           AVG(CASE WHEN location = 'Common' THEN measure_value::double ELSE 0 END) as commonAreas,
           AVG(CASE WHEN location = 'Residential' THEN measure_value::double ELSE 0 END) as residentialAvg
    FROM "${TIMESTREAM_DB}"."${TIMESTREAM_TABLE}"
    WHERE time >= ago(24h)
    GROUP BY bin(time, 1h)
    ORDER BY bin(time, 1h) ASC
  `;

  let trend = [];
  try {
    const result = await timestream.query({ QueryString: query }).promise();
    trend = result.Rows.map(row => ({
      hour: new Date(row.Data[0].ScalarValue).getHours() + ':00',
      totalUsage: parseFloat(row.Data[1].ScalarValue || 0),
      commonAreas: parseFloat(row.Data[2].ScalarValue || 0),
      residentialAvg: parseFloat(row.Data[3].ScalarValue || 0)
    }));
  } catch (err) {
    console.warn('Timestream query failed, using empty trend:', err.message);
  }

  // Get KPIs from DynamoDB alerts
  const alertsResult = await dynamodb.scan({ TableName: ALERTS_TABLE }).promise();
  const alerts = alertsResult.Items || [];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      totalConsumption: trend.reduce((sum, h) => sum + h.totalUsage, 0),
      consumptionGrowth: 2.5, // Mocked growth
      dailyAverage: 245,      // Mocked avg
      activeAlerts: alerts.filter(a => a.status !== 'dismissed').length,
      leakRisk: alerts.length > 5 ? 85 : 15,
      conservationTarget: 15000,
      buildingLevel: { totalUsage: 12450, flatCount: 50 },
      consumptionTrend: trend.length > 0 ? trend : generateMockTrend(),
      leakCandidates: alerts.filter(a => a.type === 'leak').map(a => ({
        flatId: a.flatId,
        risk: a.risk,
        nightFlow: a.nightFlow,
        baseline: a.baseline,
        reason: a.message
      }))
    })
  };
}

function generateMockTrend() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    totalUsage: Math.floor(300 + Math.random() * 400),
    commonAreas: Math.floor(50 + Math.random() * 80),
    residentialAvg: Math.floor(200 + Math.random() * 300),
  }));
}

async function getAlerts(headers) {
  const result = await dynamodb.scan({ TableName: ALERTS_TABLE }).promise();
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ alerts: result.Items || [] })
  };
}

async function deleteAlert(id, headers) {
  await dynamodb.delete({
    TableName: ALERTS_TABLE,
    Key: { alertId: id }
  }).promise();
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Alert deleted successfully' })
  };
}
