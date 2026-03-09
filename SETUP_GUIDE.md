# Quick Start Guide - Water Analytics Application

## Prerequisites
Before starting, ensure you have the following installed:
- Node.js 16+ (https://nodejs.org/)
- Git (https://git-scm.com/)
- AWS CLI (https://aws.amazon.com/cli/)
- A text editor (VS Code recommended)

## Step 1: Clone the Repository

```bash
git clone https://github.com/HarriKrishnaa/water-analytics-aws-fullstack.git
cd water-analytics-aws-fullstack
```

## Step 2: Frontend Setup

### 2.1 Install Dependencies
```bash
cd frontend
npm install
```

### 2.2 Configure Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API endpoint:
```
REACT_APP_API_BASE_URL=https://your-api-gateway-url.com
REACT_APP_REGION=us-east-1
```

### 2.3 Run Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

## Step 3: Backend Setup (AWS Lambda)

### 3.1 Install Backend Dependencies
```bash
cd ../backend/functions/backend
npm install
```

### 3.2 Configure AWS Lambda Functions

#### API Handler Lambda
1. Go to AWS Lambda Console
2. Create a new function: `api-handler`
3. Upload code from `backend/functions/backend`
4. Set Runtime to Node.js 18.x
5. Configure environment variables:
   - CORS_ORIGIN: Your Vercel domain
   - REGION: us-east-1

#### Leak Detector Lambda (3AM Daily)
1. Create a new function: `leak-detector-3am`
2. Upload code from `backend/functions/leak-detector-3am.js`
3. Set Runtime to Node.js 18.x
4. Configure environment variables:
   - TIMESTREAM_DB: water-analytics
   - DynamoDB_TABLE: alerts
   - SMTP_USER: your-email@gmail.com
   - SMTP_PASS: xxxx-xxxx-xxxx-xxxx (16-char app password from Gmail)
   - SMTP_FROM: your-email@gmail.com

### 3.3 Set Up CloudWatch Trigger
1. In Lambda Console, add trigger
2. Select "CloudWatch Events"
3. Create rule with cron: `0 3 * * ? *` (3AM UTC daily)
4. Save

## Step 4: Database Setup (DynamoDB & TimeStream)

### 4.1 Create DynamoDB Table
```bash
aws dynamodb create-table \
  --table-name alerts \
  --attribute-definitions AttributeName=alertId,AttributeType=S AttributeName=timestamp,AttributeType=N \
  --key-schema AttributeName=alertId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 4.2 Create TimeStream Database
```bash
aws timestream-write create-database \
  --database-name water-analytics \
  --region us-east-1
```

### 4.3 Create TimeStream Table
```bash
aws timestream-write create-table \
  --database-name water-analytics \
  --table-name meter-readings \
  --retention-properties MemoryStoreRetentionPeriodInHours=24,MagneticStoreRetentionPeriodInDays=365 \
  --region us-east-1
```

## Step 5: Email Alerts Setup (Gmail SMTP)

### 5.1 Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Wait for verification

### 5.2 Generate App Password
1. Go back to Security settings
2. Click "App passwords"
3. Select "Mail" and "Windows Computer"
4. Google generates 16-character password: `xxxx-xxxx-xxxx-xxxx`
5. Copy this password

### 5.3 Update Lambda Environment
1. Add to leak-detector-3am Lambda environment:
   - SMTP_USER: your-email@gmail.com
   - SMTP_PASS: (paste your 16-char password)

## Step 6: Deployment to Vercel

### 6.1 Push Code to GitHub
```bash
git add .
git commit -m "Initial full-stack application"
git push origin main
```

### 6.2 Deploy Frontend
1. Go to https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Select `frontend` folder as root
5. Add environment variables (same as .env.local)
6. Click Deploy

### 6.3 Get Vercel URL
After deployment, Vercel provides your URL:
`https://water-analytics-xxxx.vercel.app`

### 6.4 Update Lambda CORS
```bash
aws lambda update-function-configuration \
  --function-name api-handler \
  --environment Variables="{CORS_ORIGIN=https://water-analytics-xxxx.vercel.app}" \
  --region us-east-1
```

## Step 7: Testing

### Test Frontend
1. Open https://water-analytics-xxxx.vercel.app
2. Check if dashboard loads
3. Verify no console errors

### Test Email Alerts
1. Go to AWS Lambda Console
2. Select leak-detector-3am function
3. Click "Test"
4. Use sample event or create test payload
5. Check your email for alert

### Test API Endpoints
```bash
# Get Dashboard Data
curl -X GET "https://your-api-gateway.com/api/dashboard" \
  -H "Content-Type: application/json"

# Get Recent Alerts
curl -X GET "https://your-api-gateway.com/api/alerts" \
  -H "Content-Type: application/json"
```

## Troubleshooting

### Frontend Won't Load
- Check browser console for CORS errors
- Verify REACT_APP_API_BASE_URL in Vercel environment
- Confirm API Gateway CORS headers are set

### Email Not Sending
- Verify SMTP_USER and SMTP_PASS in Lambda environment
- Check Gmail account for security notifications
- Ensure 16-character app password (not regular password)
- Check Lambda execution role has necessary permissions

### Database Errors
- Verify DynamoDB table exists and is accessible
- Check TimeStream database and table creation
- Ensure IAM role has correct permissions

### Lambda Timeout
- Increase timeout in Lambda configuration (default 3 seconds)
- Optimize queries and reduce data processing

## Next Steps

1. Read [DEPLOYMENT_GUIDE.md](./frontend/DEPLOYMENT_GUIDE.md) for production deployment
2. Check [README.md](./README.md) for full project documentation
3. Review security best practices in README
4. Set up CloudWatch monitoring
5. Configure alarms for Lambda failures

## Support

For issues or questions:
1. Check GitHub Issues
2. Review AWS documentation
3. Check Lambda CloudWatch Logs
4. Verify environment variables

## Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [TimeStream Developer Guide](https://docs.aws.amazon.com/timestream/)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev)
