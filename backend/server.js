const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const v1Routes = require('./routes/v1');

const app = express();

// Middleware
app.use(helmet());
// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins to prevent CORS errors in Vercel preview environments
    callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined')); // Logger middleware

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'SkillLens API is running' });
});

// Health Route for Northflank
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    environment: config.env,
    version: '1.0.0',
    timestamp: new Date() 
  });
});

// API Versioning
app.use('/api/v1', v1Routes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = config.port || 5000;

app.listen(PORT, () => {
  logger.info(`Server running in ${config.env} mode on port ${PORT}`);
});
