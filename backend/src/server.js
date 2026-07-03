import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import { spec } from './config/openapi.js';
import { apiReference } from '@scalar/express-api-reference';
import tasksRoutes from './routes/tasksRoutes.js';

const app = express();

app.use(express.json());

app.use("/api/tasks", tasksRoutes);

app.get('/', apiReference({ pageTitle: 'Order Management API', content: spec }));

const PORT = process.env.PORT || 8000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
