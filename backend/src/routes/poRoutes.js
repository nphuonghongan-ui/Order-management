import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createPO } from '../controllers/poController.js';

const router = express.Router();

router.use(requireAuth, requireRole('PO', 'Manufacture'));

/**
 * @openapi
 * /pos:
 *   post:
 *     summary: Create one or more purchase order lines
 *     tags: [PO]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePORequest'
 *     responses:
 *       201:
 *         description: Lines created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePOResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     additionalProperties: { type: string }
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (insufficient role)
 *       404:
 *         description: Account not found
 *       409:
 *         description: One or more PO numbers already exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 existingPoNums:
 *                   type: array
 *                   items: { type: string }
 */
router.post('/', createPO);

export default router;
