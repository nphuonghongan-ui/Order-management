import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listLineItems, updateLineItem } from '../controllers/lineItemController.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /line-items:
 *   get:
 *     summary: List LineItems using cursor pagination
 *     description: |
 *       Shared read endpoint for PO, Manufacture, and Sale roles.
 *       - `PO` callers are scoped to their own `accountId`.
 *       - `Manufacture` and `Sale` callers see all items.
 *       Sorted by `createdAt` descending with `_id` as the tiebreaker.
 *     tags: [LineItems]
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
 *       - in: query
 *         name: mode
 *         schema: { type: 'string', enum: [SEA, AIR, ROAD, RAIL] }
 *         description: Filter by transport mode.
 *       - in: query
 *         name: ready
 *         schema: { type: boolean }
 *         description: |
 *           If true, returns only orders that have been "ready" by Manufacture —
 *           i.e. `exWorkDate` is set (non-null) AND `quantityPerCont` > 0.
 *           Used by the Sale-side packing-list picker. Off by default.
 *       - in: query
 *         name: customerCustId
 *         schema: { type: string }
 *         description: Filter to orders belonging to this customer (case-insensitive). Used by the PO role to scope to the logged-in account.
 *       - in: query
 *         name: excludePacked
 *         schema: { type: boolean }
 *         description: |
 *           If true, returns only orders whose `_id` is NOT referenced as `lineId`
 *           in any PackingList (across all accounts). Used by the Sale-side
 *           packing-list picker to hide orders that have already been packed.
 *           Off by default.
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
 *                 hasMore:
 *                   type: boolean
 *       400: { description: Invalid cursor }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 */
router.get('/', requireRole('PO', 'Manufacture', 'Sale'), listLineItems);

/**
 * @openapi
 * /line-items/{id}:
 *   patch:
 *     summary: Update the ExWorkDate on a single LineItem
 *     description: Restricted to the Manufacture role.
 *     tags: [LineItems]
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
router.patch('/:id', requireRole('Manufacture'), updateLineItem);

export default router;
