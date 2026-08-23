import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getYardLayout, reserveSlot } from '../controllers/slotController.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /slots/yards/{id}/layout:
 *   get:
 *     summary: Full slot grid + occupancy summary for a yard
 *     tags: [Slots]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Yard layout
 */
router.get('/yards/:id/layout', getYardLayout);

/**
 * @openapi
 * /slots/{id}/reserve:
 *   patch:
 *     summary: Toggle reservation on a slot
 *     tags: [Slots]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reserved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated slot
 */
router.patch('/:id/reserve', reserveSlot);

export default router;
