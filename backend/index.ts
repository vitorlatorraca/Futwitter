import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";

// Fail fast if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Please set it in your .env file."
  );
}

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Body parsing middleware
app.use(express.json({
  limit: '5mb', // Increase limit to allow base64 image uploads
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// CORS middleware - MUST be before routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const frontendUrl = process.env.FRONTEND_URL;
  
  // Determine allowed origin
  let allowedOrigin: string;
  
  if (process.env.NODE_ENV === 'development') {
    // In development, allow the origin from the request or any origin
    allowedOrigin = origin || '*';
  } else {
    // In production, use FRONTEND_URL if set, otherwise allow the request origin
    if (frontendUrl) {
      allowedOrigin = frontendUrl;
    } else if (origin) {
      // Fallback to request origin if FRONTEND_URL not set
      allowedOrigin = origin;
    } else {
      allowedOrigin = '*';
    }
  }
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register all API routes
registerRoutes(app);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error('Error:', err);
  res.status(status).json({ message });
});

// Start server
const port = parseInt(process.env.PORT || '5000', 10);
const server = createServer(app);

server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  if (process.env.FRONTEND_URL) {
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  }
});

