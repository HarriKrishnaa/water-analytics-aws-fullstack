const express = require('express');
const cors = require('cors');
const { handler } = require('./functions/backend/index');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper to convert Express request to Lambda event
const expressToLambda = (req) => {
  return {
    httpMethod: req.method,
    resource: req.route ? req.route.path : req.path,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query,
    headers: req.headers,
    body: JSON.stringify(req.body)
  };
};

// Route handlers
const handleRequest = async (req, res) => {
  const event = expressToLambda(req);
  const result = await handler(event);
  
  // Set headers from Lambda response
  if (result.headers) {
    Object.entries(result.headers).forEach(([key, value]) => {
      res.set(key, value);
    });
  }
  
  res.status(result.statusCode).send(result.body);
};

app.get('/api/dashboard', handleRequest);
app.get('/api/alerts', handleRequest);
app.delete('/api/alerts/:id', (req, res, next) => {
  req.route = { path: '/api/alerts/{id}' };
  next();
}, handleRequest);

app.listen(port, () => {
  console.log(`🚀 Water Analytics Local Server running at http://localhost:${port}`);
  console.log(`API endpoints:`);
  console.log(` - GET    http://localhost:${port}/api/dashboard`);
  console.log(` - GET    http://localhost:${port}/api/alerts`);
  console.log(` - DELETE http://localhost:${port}/api/alerts/:id`);
});
