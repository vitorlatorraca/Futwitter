import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Fail fast if required environment variables are missing
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Please set it in your .env file or environment variables."
  );
}

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  limit: '5mb', // Aumentar limite para permitir upload de imagens em base64
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// Health check endpoint - MUST be before CORS to avoid issues
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`🚀 Server running on port ${port}`);
    log(`📡 Health check: http://0.0.0.0:${port}/health`);
    if (process.env.FRONTEND_URL) {
      log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    }
  });
})();
