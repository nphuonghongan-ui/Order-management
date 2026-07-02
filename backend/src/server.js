import express from 'express';
import tasksRoutes from './routes/tasksRoutes.js';

const app = express();

app.use("/api/tasks", tasksRoutes);

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});



