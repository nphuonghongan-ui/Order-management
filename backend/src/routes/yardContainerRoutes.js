import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listYardContainers,
  createYardContainer,
  updateYardContainer,
  moveYardContainer,
  releaseYardContainer,
} from '../controllers/yardContainerController.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /yard-containers:
 *   get:
 *     summary: List yard containers (physical containers stored in the yard)
 *     tags: [YardContainers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [IN_YARD, GROUNDED, LOADED, OUT_GATED, RESERVED]
 *       - in: query
 *         name: typeId
 *         schema:
 *           type: string
 *           enum: [20GP, 40GP, 40HC, 45HC]
 *       - in: query
 *         name: unplaced
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List
 *   post:
 *     summary: Register a physical container in the yard (unplaced)
 *     tags: [YardContainers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Created
 */
router.get('/', listYardContainers);
router.post('/', createYardContainer);

/**
 * @openapi
 * /yard-containers/{id}:
 *   patch:
 *     summary: Update container metadata
 *     tags: [YardContainers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch('/:id', updateYardContainer);

/**
 * @openapi
 * /yard-containers/{id}/move:
 *   post:
 *     summary: Move a container to a target slot (auto-stacks at lowest empty tier)
 *     tags: [YardContainers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetSlotId]
 *             properties:
 *               targetSlotId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Moved
 *       409:
 *         description: Slot full / invalid stack
 */
router.post('/:id/move', moveYardContainer);

/**
 * @openapi
 * /yard-containers/{id}/release:
 *   post:
 *     summary: Release a container from its current slot (OUT_GATED)
 *     tags: [YardContainers]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Released
 */
router.post('/:id/release', releaseYardContainer);

export default router;
