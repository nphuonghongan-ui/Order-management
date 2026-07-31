import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { optimizePackingList } from '../controllers/clpController.js';

const router = express.Router();

router.use(requireAuth, requireRole('Sale'));

/**
 * @openapi
 * /clp/optimize:
 *   post:
 *     summary: Run the in-house Container Load Planning (CLP) optimizer
 *     description: |
 *       Joins the PackingList's items with the PartNum collection to get
 *       dimensions and per-piece weight, then runs a deterministic
 *       extreme-points + layer-packing algorithm. Returns a pre-packed
 *       list of `BoxPlacement`s in millimetres for the chosen ISO
 *       container type, plus the live fill / weight / item-count stats.
 *       Items whose partNum has no dimension or no weight are reported
 *       in `skippedPartNums` and not placed.
 *     tags: [CLP]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClpOptimizeRequest' }
 *     responses:
 *       200:
 *         description: Optimized layout
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ClpOptimizeResponse' }
 *       400: { description: plId or containerTypeId missing, or no packable items }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 *       404: { description: Packing list or container type not found }
 *       500: { description: Optimizer failure }
 */
router.post('/optimize', optimizePackingList);

export default router;
