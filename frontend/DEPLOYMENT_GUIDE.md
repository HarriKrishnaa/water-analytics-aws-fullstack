# Water Analytics AWS Full-Stack Application - Deployment Guide

## Overview
This guide covers the complete deployment process for the Water Consumption & Leakage Analytics application on AWS and Vercel.

## Prerequisites
- AWS Account with appropriate permissions
- Node.js (v14+) installed locally
- Vercel Account
- Gmail Account with App Passwords enabled
- Git installed

## Part 1: AWS Backend Setup

### 1.1 Lambda Functions Deployment

#### API Handler Lambda
- Function: `api-handler`
- Runtime: Node.js 18.x
- Environment Variables:
  ```
  CORS_ORIGIN=https://your-vercel-domain.vercel.app
  ```

#### Leak Detector Lambda (3AM Daily)
- Function: `leak-detector-3am`
- Runtime: Node.js 18.x
- Trigger: CloudWatch Events (0 3 * * ? UTC)
- Environment Variables:
  ```
  TIMESTREAM_DB=water-analytics
  DynamoDB_TABLE=alerts
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=xxxx-xxxx-xxxx-xxxx  (16-char app password)
  SMTP_FROM=alerts@wateranalytics.com
  ```

### 1.2 DynamoDB Configuration
- Table: `alerts`
  - Partition Key: `alertId` (String)
  - Sort Key: `timestamp` (Number)
  - TTL: `expiresAt` (Number)

### 1.3 TimeStream Database
- Database: `water-analytics`
- Table: `meter-readings`
  - Retention: 1 year for memory store, 3 years for magnetic store

## Part 2: SMTP Authentication Setup (16-Character Password)

### Generate Gmail App Password
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Navigate to "App passwords"
4. Select "Mail" and "Windows Computer"
5. Google will generate a 16-character password: `xxxx-xxxx-xxxx-xxxx`
6. Copy this password immediately

### Environment Configuration
Add to your Lambda environment variables:
```
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM=your-email@gmail.com
```

## Part 3: Frontend Deployment on Vercel

### 3.1 Prepare for Deployment
```bash
cd frontend
npm install
npm run build
```

### 3.2 Connect to Vercel
1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select your GitHub repository
5. Import the project

### 3.3 Environment Variables on Vercel
Set the following in Vercel dashboard:
```
REACT_APP_API_BASE_URL=https://your-lambda-api-gateway-url.com
REACT_APP_REGION=us-east-1
```

### 3.4 Deploy
- Click "Deploy"
- Vercel will automatically build and deploy your application
- Your app will be accessible at: `https://your-project.vercel.app`

## Part 4: API Integration

### Backend Routes
- `GET /api/dashboard` - Get dashboard metrics
- `GET /api/alerts` - Get recent alerts
- `POST /api/anomaly-detection` - Trigger anomaly detection

### CORS Configuration
Ensure Lambda API Gateway has CORS enabled:
```json
{
  "Access-Control-Allow-Origin": "https://your-vercel-domain.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

## Part 5: Monitoring & Testing

### Test the Email Alerts
1. Invoke leak-detector-3am Lambda manually
2. Check CloudWatch Logs for execution details
3. Verify email arrives in inbox

### View Logs
```bash
# CloudWatch Logs for Lambda
aws logs tail /aws/lambda/api-handler --follow
aws logs tail /aws/lambda/leak-detector-3am --follow
```

### Monitor TimeStream Data
```bash
aws timestream-query query \
  --query-string "SELECT * FROM water-analytics.meter-readings LIMIT 10"
```

## Part 6: Production Checklist

- [ ] All environment variables configured in Lambda
- [ ] API Gateway CORS headers set correctly
- [ ] Vercel environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] CloudWatch alarms set up
- [ ] Lambda concurrency limits configured
- [ ] DynamoDB capacity set appropriately
- [ ] Email alerts tested and working
- [ ] Frontend and backend integrated and tested

## Troubleshooting

### Lambda Cold Start Issues
- Consider provisioned concurrency for critical functions
- Optimize package size by removing unused dependencies

### CORS Errors
- Verify the Vercel domain in Lambda CORS configuration
- Check API Gateway deployment stage

### Email Not Sending
- Verify SMTP_USER and SMTP_PASS in Lambda environment
- Check Gmail account for security notifications
- Ensure app password is correct (16 characters)

### TimeStream Query Timeouts
- Add appropriate indexes for time range queries
- Use select specific attributes instead of SELECT *

## Support & Documentation
- AWS Lambda: https://docs.aws.amazon.com/lambda/
- Vercel Deployment: https://vercel.com/docs
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
