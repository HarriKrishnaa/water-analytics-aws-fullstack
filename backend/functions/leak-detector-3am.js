const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

const timestream = new AWS.TimestreamQuery();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const LEAK_THRESHOLD = 50; // liters per night
const NIGHT_START_HOUR = 2;
const NIGHT_END_HOUR = 4;

exports.handler = async (event) => {
  console.log('3AM Leak Detection Lambda triggered');
  
  try {
    const leakDetections = await detectLeaks();
    
    if (leakDetections.length > 0) {
      await sendAlerts(leakDetections);
      await logDetections(leakDetections);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Leak detection complete. Found ${leakDetections.length} potential leaks.`,
        detections: leakDetections
      })
    };
  } catch (error) {
    console.error('Leak detection error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function detectLeaks() {
  const leakDetections = [];
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Query TimeStream for night-time readings (2-4 AM) from last 7 days
  const query = `
    SELECT flatId, AVG(consumption) as avg_night_flow
    FROM "${process.env.TIMESTREAM_DB_NAME}"."${process.env.TIMESTREAM_TABLE_NAME}"
    WHERE time >= ago(7d) 
      AND EXTRACT(HOUR FROM time) BETWEEN ${NIGHT_START_HOUR} AND ${NIGHT_END_HOUR}
    GROUP BY flatId
  `;
  
  try {
    const result = await timestream.query({ QueryString: query }).promise();
    const rows = result.Rows || [];
    
    // Compare today's night flow against baseline
    for (const row of rows) {
      const flatId = row.Data[0].ScalarValue;
      const baselineFlow = parseFloat(row.Data[1].ScalarValue);
      
      // Get today's night flow (simulated - in production this queries current night)
      const todayNightFlow = await getTodayNightFlow(flatId);
      
      if (todayNightFlow > LEAK_THRESHOLD && todayNightFlow > baselineFlow * 2) {
        const riskScore = (todayNightFlow / baselineFlow) * 100;
        leakDetections.push({
          flatId,
          nightFlow: todayNightFlow,
          baseline: baselineFlow,
          risk: Math.round(riskScore),
          reason: `Night flow ${todayNightFlow.toFixed(1)}L exceeds baseline ${baselineFlow.toFixed(1)}L by ${((todayNightFlow/baselineFlow - 1) * 100).toFixed(0)}%`,
          timestamp: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('TimeStream query error:', error);
  }
  
  return leakDetections;
}

async function getTodayNightFlow(flatId) {
  // In production: query actual smart meter data for 2-4 AM today
  // For demo: return simulated data
  return Math.floor(Math.random() * 100) + 20;
}

async function sendAlerts(leakDetections) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_APP_PASSWORD
    }
  });
  
  const alertEmails = (process.env.ALERT_EMAIL_TO || '').split(',');
  
  for (const detection of leakDetections) {
    const mailOptions = {
      from: process.env.ALERT_EMAIL_FROM || 'alerts@wateranalytics.com',
      to: alertEmails.join(','),
      subject: `⚠️ WATER LEAK ALERT - ${detection.flatId}`,
      html: `
        <h2>Potential Water Leak Detected</h2>
        <p><strong>Flat:</strong> ${detection.flatId}</p>
        <p><strong>Night Flow:</strong> ${detection.nightFlow.toFixed(2)}L</p>
        <p><strong>Baseline:</strong> ${detection.baseline.toFixed(2)}L</p>
        <p><strong>Risk Score:</strong> ${detection.risk}%</p>
        <p><strong>Reason:</strong> ${detection.reason}</p>
        <p>Immediate inspection recommended.</p>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Alert sent for ${detection.flatId}`);
    } catch (error) {
      console.error(`Failed to send alert for ${detection.flatId}:`, error);
    }
  }
}

async function logDetections(leakDetections) {
  for (const detection of leakDetections) {
    try {
      await dynamodb.put({
        TableName: process.env.ALERTS_TABLE || 'water-consumption-alerts',
        Item: {
          id: `leak-${detection.flatId}-${Date.now()}`,
          flatId: detection.flatId,
          type: 'leak-detection-3am',
          ...detection
        }
      }).promise();
    } catch (error) {
      console.error(`Failed to log detection for ${detection.flatId}:`, error);
    }
  }
}
