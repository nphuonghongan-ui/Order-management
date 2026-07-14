import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listManufactureItems,
  patchManufactureItem,
} from '../controllers/manufactureController.js';

const router = express.Router();

router.use(requireAuth, requireRole('Manufacture'));

/**
 * @openapi
 * /manufacture/items:
 *   get:
 *     summary: List LineItems using cursor pagination
 *     description: |
 *       Returns items sorted by `createdAt` descending, with `_id` as the tiebreaker.
 *       Pass the previous response's `nextCursor` to fetch the next page.
 *     tags: [Manufacture]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *         description: Opaque cursor returned by the previous page; omit for the first page.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *         description: Page size (default 10, max 100).
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Case-insensitive prefix match on `poNum`.
 *     responses:
 *       200:
 *         description: A page of items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/OrderPublic' }
 *                 nextCursor:
 *                   type: string
 *                   nullable: true
 *                   description: Opaque cursor for the next page; null when there are no more items.
 *                 hasMore:
 *                   type: boolean
 *       400: { description: Invalid cursor }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 */
router.get('/items', listManufactureItems);

/**
 * @openapi
 * /manufacture/items/{id}:
 *   patch:
 *     summary: Update the ExWorkDate on a single LineItem
 *     tags: [Manufacture]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderExWorkPatch' }
 *     responses:
 *       200:
 *         description: Order updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item: { $ref: '#/components/schemas/OrderPublic' }
 *       400: { description: Invalid date }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 *       404: { description: Order not found }
 */
router.patch('/items/:id', patchManufactureItem);

export default router;
