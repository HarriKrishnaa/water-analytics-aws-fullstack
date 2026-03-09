const AWS = require('aws-sdk');

const region = process.env.AWS_REGION || 'us-east-1';
const dynamodb = new AWS.DynamoDB.DocumentClient({ region });
const timestreamWrite = new AWS.TimestreamWrite({ region });

const ALERTS_TABLE = process.env.DYNAMODB_TABLE || 'alerts';
const TIMESTREAM_DB = process.env.TIMESTREAM_DB || 'water-analytics';
const TIMESTREAM_TABLE = process.env.TIMESTREAM_TABLE || 'meter-readings';

async function seed() {
  console.log('🌱 Seeding Water Analytics Data...');

  // 1. Seed DynamoDB Alerts
  const alerts = [
    { alertId: 'leak-A204-1', flatId: 'A-204', type: 'leak', severity: 'critical', risk: 420, nightFlow: 45.2, baseline: 12.1, message: 'Excessive water usage detected — 3.7x above baseline', status: 'new', timestamp: Date.now() },
    { alertId: 'leak-B101-1', flatId: 'B-101', type: 'leak', severity: 'high', risk: 280, nightFlow: 28.7, baseline: 10.5, message: 'Possible pipe leak — night flow 2.7x above normal', status: 'new', timestamp: Date.now() - 3600000 },
    { alertId: 'leak-C305-1', flatId: 'C-305', type: 'leak', severity: 'warning', risk: 155, nightFlow: 18.3, baseline: 9.8, message: 'Above-average consumption — monitoring in progress', status: 'acknowledged', timestamp: Date.now() - 7200000 }
  ];

  for (const alert of alerts) {
    try {
      await dynamodb.put({ TableName: ALERTS_TABLE, Item: alert }).promise();
      console.log(` ✅ Seeded alert for ${alert.flatId}`);
    } catch (err) {
      console.warn(` ⚠️ Could not seed DynamoDB alert for ${alert.flatId}: ${err.message}`);
    }
  }

  // 2. Seed Timestream Readings
  const records = [];
  const currentTime = Date.now();
  
  // Last 24 hours of data
  for (let i = 0; i < 24; i++) {
    const timestamp = currentTime - i * 3600000;
    records.push({
      Dimensions: [{ Name: 'location', Value: 'Total' }],
      MeasureName: 'consumption',
      MeasureValue: (300 + Math.random() * 400).toString(),
      MeasureValueType: 'DOUBLE',
      Time: timestamp.toString()
    });
    records.push({
      Dimensions: [{ Name: 'location', Value: 'Common' }],
      MeasureName: 'consumption',
      MeasureValue: (50 + Math.random() * 80).toString(),
      MeasureValueType: 'DOUBLE',
      Time: timestamp.toString()
    });
    records.push({
      Dimensions: [{ Name: 'location', Value: 'Residential' }],
      MeasureName: 'consumption',
      MeasureValue: (200 + Math.random() * 300).toString(),
      MeasureValueType: 'DOUBLE',
      Time: timestamp.toString()
    });
  }

  try {
    // Timestream write in batches of 100
    await timestreamWrite.writeRecords({
      DatabaseName: TIMESTREAM_DB,
      TableName: TIMESTREAM_TABLE,
      Records: records
    }).promise();
    console.log(` ✅ Seeded ${records.length} readings to Timestream`);
  } catch (err) {
    console.warn(` ⚠️ Could not seed Timestream readings: ${err.message}`);
  }

  console.log('Done!');
}

seed();
