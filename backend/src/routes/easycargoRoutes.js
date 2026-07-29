import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createShipment } from '../controllers/easycargoController.js';

const router = express.Router();

router.use(requireAuth, requireRole('Sale'));

/**
 * @openapi
 * /easycargo/shipment:
 *   post:
 *     summary: Create an easy-cargo shipment for a packing list
 *     description: |
 *       Looks up the packing list, joins with the PartNum collection to
 *       get dimensions, creates a shipment on easy-cargo via their REST
 *       API, then fetches the shipment details to return the
 *       `open_shipment_url`. The user opens that URL in a new tab to
 *       view and calculate the load plan in easy-cargo's web app.
 *     tags: [EasyCargo]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plId]
 *             properties:
 *               plId: { type: string, description: MongoDB _id of the packing list }
 *     responses:
 *       200:
 *         description: Shipment created (or existing shipment re-used)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 openShipmentUrl: { type: string, description: URL to open the shipment in easy-cargo }
 *                 shipmentId: { type: string }
 *                 skippedPartNums:
 *                   type: array
 *                   items: { type: string }
 *                   description: PartNums in the PL that had no dimension in the PartNum collection (only populated on a fresh create)
 *                 alreadySent:
 *                   type: boolean
 *                   description: |
 *                     `true` when the response is a re-used existing shipment (no easy-cargo API call was made);
 *                     `false` when a new shipment was just created.
 *       400: { description: plId missing }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (insufficient role) }
 *       404: { description: Packing list not found }
 *       500: { description: easy-cargo API error or missing env credentials }
 */
router.post('/shipment', createShipment);

export default router;
