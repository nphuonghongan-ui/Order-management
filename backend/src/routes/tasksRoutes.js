import express from 'express';
import { createTask, getAllTasks, updateTask, deleteTask } from '../controllers/tasksControllers.js';

const router = express.Router();

router.get("/", getAllTasks);

router.post("/", createTask);

router.put("/", updateTask);

router.delete("/", deleteTask);

export default router;

