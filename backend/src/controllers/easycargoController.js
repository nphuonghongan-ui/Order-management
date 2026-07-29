import PackingList from '../models/PackingList.js';
import { createShipmentFromPackingList } from '../services/easycargoService.js';

/**
 * POST /api/easycargo/shipment
 * Body: { plId: string }
 * Returns: { shipmentId, openShipmentUrl, skippedPartNums, alreadySent }
 *
 * State machine on PackingList:
 *   - isShipmentCreated=false                       → CREATE new shipment
 *   - isShipmentCreated=true, isUpdated=false       → RE-USE existing link
 *   - isShipmentCreated=true, isUpdated=true        → CREATE new shipment
 *                                                   (then set isShipmentCreated=true, isUpdated=false)
 *
 * Any easy-cargo call (success) persists:
 *   easycargoShipmentId, easycargoShipmentUrl, easycargoSentAt,
 *   isShipmentCreated=true, isUpdated=false
 */
export async function createShipment(req, res) {
  try {
    const { plId } = req.body || {};
    if (!plId) {
      return res.status(400).json({ message: 'plId is required' });
    }

    const packingList = await PackingList.findById(plId);
    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }

    // Re-use the existing link if the PL has been sent and not
    // modified since. No easy-cargo API call, no DB write.
    if (packingList.isShipmentCreated && !packingList.isUpdated) {
      return res.json({
        shipmentId: packingList.easycargoShipmentId,
        openShipmentUrl: packingList.easycargoShipmentUrl,
        skippedPartNums: [],
        alreadySent: true,
      });
    }

    // First send, or the PL was modified after the last send.
    const result = await createShipmentFromPackingList(packingList);

    // Persist the new sync state.
    packingList.easycargoShipmentId = result.shipmentId;
    packingList.easycargoShipmentUrl = result.openShipmentUrl;
    packingList.easycargoSentAt = new Date();
    packingList.isShipmentCreated = true;
    packingList.isUpdated = false;
    await packingList.save();

    res.json({
      shipmentId: result.shipmentId,
      openShipmentUrl: result.openShipmentUrl,
      skippedPartNums: result.skippedPartNums,
      alreadySent: false,
    });
  } catch (err) {
    console.error('[easycargo] createShipment failed:', err);
    res.status(500).json({
      message: err instanceof Error ? err.message : 'Failed to create easy-cargo shipment',
    });
  }
}
