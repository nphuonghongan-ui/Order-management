import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listYards,
  getYard,
  createYard,
} from '../controllers/yardController.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /yards:
 *   get:
 *     summary: List yards for the current customer
 *     tags: [Yards]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of yards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/YardPublic'
 *   post:
 *     summary: Create a yard (topology)
 *     tags: [Yards]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/', listYards);
router.post('/', createYard);

/**
 * @openapi
 * /yards/{id}:
 *   get:
 *     summary: Get a yard by id
 *     tags: [Yards]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Yard
 */
router.get('/:id', getYard);

export default router;
