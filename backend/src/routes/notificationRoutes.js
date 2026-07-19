import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  listMyNotifications,
  sendUrgeUpdate,
  markRead,
  markAllRead,
  deleteNotification,
  listManufactureRecipients,
  notifyManufactureQtyMismatch,
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: List notifications addressed to the current user
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 50 }
 *       - in: query
 *         name: cursor
 *         schema: { type: string }
 *       - in: query
 *         name: unreadOnly
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: Page of notifications }
 *       400: { description: Invalid cursor }
 *       401: { description: Not authenticated }
 */
router.get('/', listMyNotifications);

/**
 * @openapi
 * /notifications/recipients:
 *   get:
 *     summary: List Manufacture accounts available as notification recipients
 *     description: Used by the Sale role to pick a target when sending an "urge" notification.
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of Manufacture accounts }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (not Sale) }
 */
router.get('/recipients', requireRole('Sale'), listManufactureRecipients);

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all of the caller's notifications as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Updated }
 *       401: { description: Not authenticated }
 */
router.patch('/read-all', markAllRead);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read (recipient only)
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Updated }
 *       404: { description: Notification not found }
 *       401: { description: Not authenticated }
 */
router.patch('/:id/read', markRead);

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a single notification (recipient only)
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 *       404: { description: Notification not found }
 *       401: { description: Not authenticated }
 */
router.delete('/:id', deleteNotification);

/**
 * @openapi
 * /notifications:
 *   post:
 *     summary: Send an "urge update orders" notification to a Manufacture account
 *     description: Sale-only. Persists the notification and emits `notification:new` to the recipient's socket room.
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientCustomerCustId]
 *             properties:
 *               recipientCustomerCustId: { type: string }
 *               message: { type: string }
 *               context:
 *                 type: object
 *                 properties:
 *                   poNum: { type: string }
 *                   orderId: { type: string }
 *     responses:
 *       201: { description: Created }
 *       400: { description: Validation error }
 *       404: { description: Recipient not found }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (not Sale) }
 */
router.post('/', requireRole('Sale'), sendUrgeUpdate);

/**
 * @openapi
 * /notifications/qty-mismatch:
 *   post:
 *     summary: Notify Manufacture that a line's Qty per Cont needs adjusting
 *     description: |
 *       Sale-only. Flags the given orders with `pendingManufactureUpdate=true` and sends
 *       a QTY_PER_CONT_MISMATCH notification to the first available Manufacture account,
 *       carrying the offending `riskLines` in the notification context.
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [affectedOrderIds]
 *             properties:
 *               affectedOrderIds:
 *                 type: array
 *                 items: { type: string }
 *               riskLines:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     lineId: { type: string }
 *                     poNum: { type: string }
 *                     partNum: { type: string }
 *                     pickedQty: { type: number }
 *                     quantityPerCont: { type: number }
 *               message: { type: string }
 *               poNum: { type: string }
 *               orderId: { type: string }
 *     responses:
 *       201: { description: Notification sent and orders flagged }
 *       400: { description: Validation error }
 *       404: { description: No matching orders or no Manufacture recipient }
 *       401: { description: Not authenticated }
 *       403: { description: Forbidden (not Sale) }
 */
router.post('/qty-mismatch', requireRole('Sale'), notifyManufactureQtyMismatch);

export default router;
