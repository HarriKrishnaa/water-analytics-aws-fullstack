// Vercel Serverless Function - Alerts API with SMTP
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Alert data with varied severities
  const alerts = [
    { 
      id: 1, 
      flatId: 'A-204', 
      risk: 420, 
      nightFlow: 45.2, 
      baseline: 12.1, 
      ratio: 3.74, 
      severity: 'high', 
      message: 'Excessive water usage detected — 3.7x above baseline',
      detectionReason: 'Consistent night-time flow detected over 3 days exceeding baseline by 3.7x'
    },
    { 
      id: 2, 
      flatId: 'B-101', 
      risk: 280, 
      nightFlow: 28.7, 
      baseline: 10.5, 
      ratio: 2.73, 
      severity: 'high', 
      message: 'Possible pipe leak — night flow 2.7x above normal',
      detectionReason: 'Night flow ratio above threshold; possible slow leak in bathroom'
    },
    { 
      id: 3, 
      flatId: 'C-305', 
      risk: 155, 
      nightFlow: 18.3, 
      baseline: 9.8, 
      ratio: 1.87, 
      severity: 'warning', 
      message: 'Above-average consumption — monitoring recommended',
      detectionReason: 'Moderate night-time usage; monitoring in progress'
    }
  ];
  
  // Handle GET request - return alerts
  if (req.method === 'GET') {
    return res.status(200).json({ alerts, count: alerts.length });
  }
  
  // Handle POST request - send email alert
  if (req.method === 'POST') {
    const { flatId, recipientEmail, sendEmail } = req.body || {};
    
    if (!sendEmail) {
      return res.status(200).json({ alerts, emailSent: false });
    }
    
    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email required' });
    }
    
    try {
      // Import nodemailer dynamically
      const nodemailer = require('nodemailer');
      
      // Find the alert for the flat
      const alert = alerts.find(a => a.flatId === flatId) || alerts[0];
      
      // Create transporter with Gmail SMTP
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || 'harrikrishnaa@gmail.com',
          pass: 'vqzmstciicvawxru' // Your app password
        }
      });
      
      // Email content
      const mailOptions = {
        from: process.env.SMTP_USER || 'Water Analytics System',
        to: recipientEmail,
        subject: `🚨 Water Leak Alert - Flat ${alert.flatId}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #dc2626; margin-top: 0;">🚨 Critical Water Leak Detected</h2>
              
              <div style="background: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
                <h3 style="margin: 0; color: #991b1b;">Flat: ${alert.flatId}</h3>
                <p style="margin: 5px 0; font-size: 16px;"><strong>Risk Score:</strong> ${alert.risk}% (${alert.severity.toUpperCase()})</p>
              </div>
              
              <h3 style="color: #333;">Detection Details:</h3>
              <ul style="line-height: 1.8; color: #555;">
                <li><strong>Night Flow:</strong> ${alert.nightFlow}L (${alert.ratio}x above baseline)</li>
                <li><strong>Baseline:</strong> ${alert.baseline}L</li>
                <li><strong>Detection Reason:</strong> ${alert.detectionReason}</li>
              </ul>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="margin: 0; color: #666;"><strong>Message:</strong> ${alert.message}</p>
              </div>
              
              <p style="margin-top: 25px; color: #777; font-size: 14px;">
                This is an automated alert from the Water Analytics System.<br>
                Please take immediate action to inspect the water supply in this flat.
              </p>
            </div>
          </div>
        `
      };
      
      // Send email
      await transporter.sendMail(mailOptions);
      
      return res.status(200).json({ 
        success: true, 
        emailSent: true, 
        message: `Alert email sent to ${recipientEmail}`,
        alert 
      });
      
    } catch (error) {
      console.error('Email error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to send email', 
        details: error.message 
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}