import path from "path";
import { createServer } from "./index";
import * as express from "express";
import { logger } from "./utils/helpers";
import { getConfig } from "./config";

const config = getConfig();
const app = createServer();

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files (CSS, JS, images, etc.)
app.use(express.static(distPath, {
  maxAge: '1h',
  etag: false,
}));

// SPA fallback: serve index.html for all non-API routes using middleware (Express 5 compatible)
app.use((req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }

  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      logger.error('Error serving index.html', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
});

const port = config.PORT;
const server = app.listen(port, () => {
  logger.info(`🚀 DevSensei server running on port ${port}`);
  logger.info(`📱 Frontend: http://localhost:${port}`);
  logger.info(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', reason);
  process.exit(1);
});
