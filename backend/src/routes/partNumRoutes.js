import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listPartNums,
  getNextPartNumNo,
  createPartNum,
  importPartNums,
  deletePartNum,
} from '../controllers/partNumController.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /part-nums:
 *   get:
 *     summary: List part numbers (paginated when ?limit is present)
 *     description: |
 *       When called without `?limit`, returns all part numbers (backwards-compatible
 *       for legacy consumers that need the full list).
 *
 *       When `?limit` is provided, returns a single cursor-paginated page sorted
 *       by `no` ASC, `partNum` ASC. `q` filters by case-insensitive substring
 *       match on `partNum`. `cursor` (opaque, returned as `nextCursor`) is used
 *       to fetch the next page.
 *     tags: [PartNums]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Case-insensitive substring filter on `partNum`.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 100 }
 *         description: When present, enables cursor pagination. Max 100 per page.
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *         description: Opaque cursor returned by the previous page's `nextCursor`.
 *     responses:
 *       200:
 *         description: Part number page
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PartNumListResponse'
 *       400:
 *         description: Invalid cursor
 *       401:
 *         description: Unauthorized
 */
router.get('/', listPartNums);

/**
 * @openapi
 * /part-nums/next-no:
 *   get:
 *     summary: Get the next available sequence number (Manufacture)
 *     description: Returns `max(no) + 1` so the UI can pre-fill the No. field.
 *     tags: [PartNums]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Next sequence number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 no: { type: integer, minimum: 1 }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get('/next-no', requireRole('Manufacture'), getNextPartNumNo);

/**
 * @openapi
 * /part-nums:
 *   post:
 *     summary: Create a single part number (Manufacture)
 *     tags: [PartNums]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePartNumRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item: { $ref: '#/components/schemas/PartNumPublic' }
 *       400: { description: Validation failed }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       409: { description: Duplicate partNum or no }
 */
router.post('/', requireRole('Manufacture'), createPartNum);

/**
 * @openapi
 * /part-nums/import:
 *   post:
 *     summary: Bulk import part numbers from an Excel/CSV payload (Manufacture)
 *     description: |
 *       Accepts a JSON array of rows parsed from a spreadsheet. The server
 *       validates each row, skips duplicates by `partNum`, and inserts the
 *       rest. Returns per-row errors so the UI can show a partial-success
 *       report. Max 1000 rows per request.
 *     tags: [PartNums]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImportPartNumRequest'
 *     responses:
 *       200:
 *         description: Import report
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ImportPartNumResponse' }
 *       400: { description: Validation failed (no valid rows, too many) }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post('/import', requireRole('Manufacture'), importPartNums);

/**
 * @openapi
 * /part-nums/{id}:
 *   delete:
 *     summary: Delete a part number (Manufacture)
 *     tags: [PartNums]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 *       404: { description: Part number not found }
 */
router.delete('/:id', requireRole('Manufacture'), deletePartNum);

export default router;
