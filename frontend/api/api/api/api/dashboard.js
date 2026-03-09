// Vercel Serverless Function - Dashboard API
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Generate dynamic dashboard data
  const currentTime = new Date();
  const baseConsumption = 12450;
  const variation = Math.random() * 1000 - 500;
  
  const data = {
    totalConsumption: Math.floor(baseConsumption + variation),
    consumptionGrowth: (2 + Math.random() * 3).toFixed(1),
    dailyAverage: Math.floor(240 + Math.random() * 20),
    activeAlerts: Math.floor(2 + Math.random() * 3),
    leakRisk: Math.floor(15 + Math.random() * 10),
    lastUpdated: currentTime.toISOString(),
    buildingLevel: {
      totalUsage: Math.floor(baseConsumption + variation),
      flatCount: 50,
      conservationTarget: 15000
    },
    consumptionTrend: Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      totalUsage: Math.floor(300 + Math.random() * 400 + Math.sin(i / 3) * 100),
      commonAreas: Math.floor(50 + Math.random() * 80),
      residentialAvg: Math.floor(200 + Math.random() * 300)
    }))
  };
  
  res.status(200).json(data);
}
