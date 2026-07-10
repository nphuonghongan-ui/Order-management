import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createPO, getNextPONum } from '../controllers/poController.js';

const router = express.Router();

router.use(requireAuth, requireRole('PO'));

/**
 * @openapi
 * /pos/next-po-num:
 *   get:
 *     summary: Get the next server-assigned PO number
 *     description: |
 *       Atomically increments the per-account counter and returns a fresh PO
 *       number in the format `POSRS-{5-digit}-{unixMs}`. The counter is
 *       lazily initialised past any existing POs that already use the new
 *       format. Old-format POs (POSRS0xxxx) are structurally distinct and
 *       ignored.
 *     tags: [PO]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: A fresh PO number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 poNum:
 *                   type: string
 *                   example: POSRS-00001-1736543212123
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 *       404: { description: Account not found }
 */
router.get('/next-po-num', getNextPONum);

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
 *         description: One or more (poNum, orderLine) pairs already exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 existingPairs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       poNum: { type: string }
 *                       orderLine: { type: integer }
 */
router.post('/', createPO);

export default router;
