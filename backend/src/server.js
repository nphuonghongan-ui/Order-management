import 'dotenv/config';
import http from 'http';
import https from 'https';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { spec } from './config/openapi.js';
import { autoSeed } from './config/seed.js';
import { initSocket } from './lib/socket.js';
import { apiReference } from '@scalar/express-api-reference';
import tasksRoutes from './routes/tasksRoutes.js';
import authRoutes from './routes/authRoutes.js';
import poRoutes from './routes/poRoutes.js';
import manufactureRoutes from './routes/manufactureRoutes.js';
import lineItemRoutes from './routes/lineItemRoutes.js';
import packingListRoutes from './routes/packingListRoutes.js';
import partNumRoutes from './routes/partNumRoutes.js';
import containerRoutes from './routes/containerRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import easycargoRoutes from './routes/easycargoRoutes.js';
import clpRoutes from './routes/clpRoutes.js';

if (!process.env.ACCESS_TOKEN_SECRET) {
  console.warn('[WARN] ACCESS_TOKEN_SECRET is not set. Auth will fail until it is.');
}

const app = express();

const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: origins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/tasks", tasksRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pos", poRoutes);
app.use("/api/manufacture", manufactureRoutes);
app.use("/api/line-items", lineItemRoutes);
app.use("/api/packing-list", packingListRoutes);
app.use("/api/part-nums", partNumRoutes);
app.use("/api/containers", containerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/easycargo", easycargoRoutes);
app.use("/api/clp", clpRoutes);

app.get('/', apiReference({ pageTitle: 'Order Management API', content: spec }));

const PORT = process.env.PORT || 8000;
const useHttps = process.env.USE_HTTPS === 'true';

let server;
if (useHttps) {
  const keyPath = process.env.SSL_KEY;
  const certPath = process.env.SSL_CERT;
  if (!keyPath || !certPath) {
    throw new Error('[server] SSL_KEY and SSL_CERT must be set when USE_HTTPS=true');
  }
  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error(
      `[server] TLS files missing: expected ${keyPath} and ${certPath}. ` +
      'Generate with "mkcert -install && mkcert localhost 127.0.0.1 ::1" inside backend/certs/.'
    );
  }
  const key = fs.readFileSync(keyPath);
  const cert = fs.readFileSync(certPath);
  server = https.createServer({ key, cert }, app);
} else {
  server = http.createServer(app);
}

connectDB().then(async () => {
  await autoSeed();
  initSocket(server, origins);
  const protocol = useHttps ? 'https' : 'http';
  server.listen(PORT, () => {
    console.log(`Server is running on ${protocol}://localhost:${PORT}`);
  });
});
