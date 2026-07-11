import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { spec } from './config/openapi.js';
import { apiReference } from '@scalar/express-api-reference';
import tasksRoutes from './routes/tasksRoutes.js';
import authRoutes from './routes/authRoutes.js';
import poRoutes from './routes/poRoutes.js';
import manufactureRoutes from './routes/manufactureRoutes.js';
import lineItemRoutes from './routes/lineItemRoutes.js';
import packingListRoutes from './routes/packingListRoutes.js';

if (!process.env.JWT_SECRET) {
  console.warn('[WARN] JWT_SECRET is not set. Auth will fail until it is.');
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

app.get('/', apiReference({ pageTitle: 'Order Management API', content: spec }));

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
