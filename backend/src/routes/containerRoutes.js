import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listContainers } from '../controllers/containerController.js';

const router = express.Router();

router.use(requireAuth);

/**
 * @openapi
 * /containers:
 *   get:
 *     summary: List all shipping container types
 *     description: Returns the reference list of ISO container types used by the 3D viewer and the CLP optimizer.
 *     tags: [Containers]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Array of container types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContainerPublic'
 *       401:
 *         description: Unauthorized
 */
router.get('/', listContainers);

export default router;
