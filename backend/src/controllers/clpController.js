import PackingList from '../models/PackingList.js';
import PartNum from '../models/PartNum.js';
import Container from '../models/Container.js';
import {
  buildItemsFromPackingList,
  optimize,
} from '../services/clpOptimizer.js';

const VALID_TYPES = ['20GP', '40GP', '40HC', '45HC'];

export async function optimizePackingList(req, res) {
  try {
    const { plId, containerTypeId } = req.body || {};
    if (!plId) {
      return res.status(400).json({ message: 'plId is required' });
    }
    if (!containerTypeId || !VALID_TYPES.includes(containerTypeId)) {
      return res.status(400).json({
        message: `containerTypeId must be one of: ${VALID_TYPES.join(', ')}`,
      });
    }

    const packingList = await PackingList.findById(plId);
    if (!packingList) {
      return res.status(404).json({ message: 'Packing list not found' });
    }

    const container = await Container.findOne({ typeId: containerTypeId });
    if (!container) {
      return res.status(404).json({ message: `Container type ${containerTypeId} not found` });
    }

    const partNums = [...new Set(packingList.items.map((it) => it.partNum))];
    const partNumDocs = await PartNum.find({ partNum: { $in: partNums } });
    const partNumMap = new Map(
      partNumDocs.map((p) => [
        p.partNum,
        {
          length: p.dimension.length,
          width: p.dimension.width,
          height: p.dimension.height,
          weightKg: p.weightKg ?? 0,
        },
      ])
    );

    const { items, skipped } = buildItemsFromPackingList(packingList, partNumMap);

    if (items.length === 0) {
      return res.status(400).json({
        message: 'Packing list has no items with dimensions and weight',
        skippedPartNums: skipped,
      });
    }

    const result = optimize({
      items,
      container: {
        inner: container.inner,
        maxWeightKg: container.maxWeightKg,
      },
      containerMaxWeight: container.maxWeightKg,
    });

    return res.status(200).json({
      containerTypeId,
      placements: result.placements,
      stats: result.stats,
      skippedPartNums: skipped,
    });
  } catch (err) {
    console.error('[clp] optimize failed:', err);
    return res.status(500).json({
      message: err instanceof Error ? err.message : 'Failed to run CLP optimizer',
    });
  }
}
