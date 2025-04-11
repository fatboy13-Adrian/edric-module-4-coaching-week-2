const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Custom token for request body logging (when needed)
morgan.token('body', (req) => {
  return JSON.stringify(req.body);
});

// Create console logger middleware
const consoleLogger = morgan(':method :url :status :res[content-length] - :response-time ms');

// Create file logger middleware with more detailed format
const fileLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
  { stream: accessLogStream }
);

// Combine both loggers
const logger = (req, res, next) => {
  fileLogger(req, res, (err) => {
    if (err) return next(err);
    consoleLogger(req, res, next);
  });
};

module.exports = logger; 