import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  createPackingList,
  deletePackingList,
  getPackingList,
  listPackingLists,
  updatePackingList,
} from '../controllers/packingListController.js';

const router = express.Router();

router.use(requireAuth, requireRole('Sale'));

/**
 * @openapi
 * /packing-list:
 *   get:
 *     summary: List all packing lists
 *     description: |
 *       Returns all packing lists sorted by `createdAt` descending, with `_id`
 *       as the tiebreaker. `Sale` role only. Currently no per-account
 *       filtering — all PLs are visible to every Sale caller (matches the
 *       line-items reads for Manufacture/Sale).
 *     tags: [PackingList]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: A list of packing lists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lists:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/PackingListPublic' }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 */
router.get('/', listPackingLists);

/**
 * @openapi
 * /packing-list/{id}:
 *   get:
 *     summary: Get a single packing list
 *     tags: [PackingList]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB _id of the PackingList document.
 *     responses:
 *       200:
 *         description: A packing list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list: { $ref: '#/components/schemas/PackingListPublic' }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 *       404: { description: Packing list not found }
 */
router.get('/:id', getPackingList);

/**
 * @openapi
 * /packing-list:
 *   post:
 *     summary: Create a packing list
 *     description: |
 *       `Sale` role only. `plNumber` is server-generated in the format
 *       `PL-{Account.customerCustId}-{ms-timestamp}` — any client-supplied
 *       `plNumber` is ignored.
 *
 *       `items[].lineId` must reference an existing `Order` document; the
 *       `itemsCount` and `total` fields are server-computed from the supplied
 *       items. Zero items is rejected at validation time.
 *     tags: [PackingList]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SubmitPackingListRequest' }
 *     responses:
 *       201:
 *         description: Packing list created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list: { $ref: '#/components/schemas/PackingListPublic' }
 *       400:
 *         description: |
 *           Validation failed, one or more referenced `lineId`s do not
 *           exist, or one or more items would exceed the remaining unpacked
 *           quantity for that order line (`requested.qty +
 *           already-packed.qty > Order.orderDtl.sellingQuantity`). The
 *           `errors` array is keyed by field path; the `missing` array
 *           (lineId-existence failure) lists the offending ObjectIds; the
 *           `overPacked` array (over-pack failure) lists `lineId`,
 *           `sellingQuantity`, `alreadyPacked`, and `requested`.
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
 *                 missing:
 *                   type: array
 *                   items: { type: string }
 *                 overPacked:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       lineId: { type: string }
 *                       sellingQuantity: { type: integer }
 *                       alreadyPacked: { type: integer }
 *                       requested: { type: integer }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 *       404: { description: Caller's Account not found }
 *       409:
 *         description: Server-generated plNumber collided (extremely unlikely)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.post('/', createPackingList);

/**
 * @openapi
 * /packing-list/{id}:
 *   delete:
 *     summary: Hard-delete a packing list
 *     tags: [PackingList]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB _id of the PackingList document.
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 *       404: { description: Packing list not found }
 */
router.delete('/:id', deletePackingList);

/**
 * @openapi
 * /packing-list/{id}:
 *   patch:
 *     summary: Update a packing list (items, customer, or delivery)
 *     description: |
 *       `Sale` role only. Applies a sequence of operations atomically inside
 *       a Mongoose transaction. The accepted operations are:
 *         - `set_qty { lineId, qty }` — change a line's qty. The Order's
 *           `orderDtl.sellingQuantity` is adjusted by `(oldQty - newQty)` so
 *           the remaining-to-pack invariant holds. Multiple `set_qty` ops
 *           targeting the same `lineId` collapse to the last one. Over-pack
 *           is rejected: `newQty` must be `<= Order.sellingQuantity + this
 *           PL's current qty for that line` (i.e. the original ordered).
 *         - `set_customer { name, address, contact?, email? }` — replace the
 *           customer subdoc on the PL.
 *         - `set_delivery { name, address, shipDate?, notes? }` — replace the
 *           delivery subdoc on the PL.
 *       `itemsCount` and `total` are server-computed from the final state.
 *     tags: [PackingList]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB _id of the PackingList document.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdatePackingListRequest' }
 *     responses:
 *       200:
 *         description: Updated packing list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 list: { $ref: '#/components/schemas/PackingListPublic' }
 *       400:
 *         description: |
 *           Validation failed (op shape) or over-pack rejected. `opErrors` is
 *           populated for shape errors; the top-level `message` carries the
 *           over-pack detail.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string' }
 *                 opErrors:
 *                   type: array
 *                   items: { type: 'object' }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 *       404: { description: Packing list not found }
 */
router.patch('/:id', updatePackingList);

export default router;