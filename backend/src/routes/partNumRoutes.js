import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listPartNums } from '../controllers/partNumController.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /part-nums:
 *   get:
 *     summary: List all part numbers with dimensions
 *     tags: [PartNums]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of part numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PartNumPublic'
 *       401:
 *         description: Unauthorized
 */
router.get('/', listPartNums);

export default router;
