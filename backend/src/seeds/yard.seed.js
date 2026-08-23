import 'dotenv/config';
import mongoose from 'mongoose';
import Yard from '../models/Yard.js';
import Slot from '../models/Slot.js';
import YardContainer from '../models/YardContainer.js';

const CUST_ID = process.env.SEED_YARD_CUST_ID || 'DYL';
const YARD_CODE = process.env.SEED_YARD_CODE || 'YRD-A';
const YARD_NAME = 'Main Yard';
const TOTAL_ROWS = 6;
const TOTAL_COLS = 20;
const DEFAULT_MAX_TIER = 1;
const STACKABLE_MAX_TIER = 2;
const STACKABLE_FRACTION = 0.25;

const SAMPLE_CONTAINERS = [
  { containerNo: 'MSCU1234567', typeId: '20GP', ownerName: 'Acme Logistics', sealNo: 'SEAL-001', grossWeightKg: 18200 },
  { containerNo: 'MSCU2234567', typeId: '20GP', ownerName: 'Acme Logistics', sealNo: 'SEAL-002', grossWeightKg: 19100 },
  { containerNo: 'TGHU3345678', typeId: '40GP', ownerName: 'GlobalShip Co', sealNo: 'SEAL-101', grossWeightKg: 24500 },
  { containerNo: 'TGHU4345678', typeId: '40HC', ownerName: 'GlobalShip Co', sealNo: 'SEAL-102', grossWeightKg: 26800 },
  { containerNo: 'CAIU5567890', typeId: '40HC', ownerName: 'TransPacific', sealNo: 'SEAL-201', grossWeightKg: 27100 },
  { containerNo: 'CAIU6567890', typeId: '45HC', ownerName: 'TransPacific', sealNo: 'SEAL-202', grossWeightKg: 28800 },
  { containerNo: 'MAEU7788991', typeId: '20GP', ownerName: 'BlueOcean', sealNo: 'SEAL-301', grossWeightKg: 17800 },
  { containerNo: 'MAEU8788991', typeId: '40GP', ownerName: 'BlueOcean', sealNo: 'SEAL-302', grossWeightKg: 23900 },
];

function cellCoord(idx, rowCount, colCount) {
  const blockIndex = Math.floor(idx / (rowCount * colCount / 2));
  const withinBlock = idx % (rowCount * colCount / 2);
  const blockRow = Math.floor(withinBlock / colCount);
  const blockCol = withinBlock % colCount;
  const blockStartRow = blockIndex === 0 ? 1 : Math.floor(rowCount / 2) + 1;
  const blockEndRow = blockIndex === 0 ? Math.floor(rowCount / 2) : rowCount;
  return {
    blockCode: blockIndex === 0 ? 'BLK-1' : 'BLK-2',
    row: blockStartRow + blockRow,
    col: blockCol + 1,
    blockStartRow,
    blockEndRow,
  };
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/order-management';
  await mongoose.connect(uri);

  await Yard.deleteMany({ customerCustId: CUST_ID, code: YARD_CODE });
  await Slot.deleteMany({ customerCustId: CUST_ID });
  await YardContainer.deleteMany({ customerCustId: CUST_ID });

  const yard = await Yard.create({
    customerCustId: CUST_ID,
    name: YARD_NAME,
    code: YARD_CODE,
    totalRows: TOTAL_ROWS,
    totalCols: TOTAL_COLS,
    defaultMaxTier: DEFAULT_MAX_TIER,
    blocks: [
      {
        code: 'BLK-1',
        label: 'Block 1',
        startRow: 1,
        endRow: Math.floor(TOTAL_ROWS / 2),
        startCol: 1,
        endCol: TOTAL_COLS,
      },
      {
        code: 'BLK-2',
        label: 'Block 2',
        startRow: Math.floor(TOTAL_ROWS / 2) + 1,
        endRow: TOTAL_ROWS,
        startCol: 1,
        endCol: TOTAL_COLS,
      },
    ],
  });

  const totalSlots = TOTAL_ROWS * TOTAL_COLS;
  const stackableCount = Math.floor(totalSlots * STACKABLE_FRACTION);
  const slotDocs = [];
  for (let i = 0; i < totalSlots; i += 1) {
    const coord = cellCoord(i, TOTAL_ROWS, TOTAL_COLS);
    const maxTier = i < stackableCount ? STACKABLE_MAX_TIER : DEFAULT_MAX_TIER;
    for (let tier = 1; tier <= maxTier; tier += 1) {
      slotDocs.push({
        customerCustId: CUST_ID,
        yardId: yard._id,
        blockCode: coord.blockCode,
        row: coord.row,
        col: coord.col,
        tier,
        maxTier,
        yardContainerId: null,
        isReserved: false,
      });
    }
  }
  await Slot.insertMany(slotDocs);

  const placedContainers = [];
  for (let i = 0; i < SAMPLE_CONTAINERS.length; i += 1) {
    const seed = SAMPLE_CONTAINERS[i];
    const slot = await Slot.findOne({
      yardId: yard._id,
      tier: 1,
      yardContainerId: null,
    }).sort({ row: 1, col: 1 });
    if (!slot) break;
    const container = await YardContainer.create({
      customerCustId: CUST_ID,
      containerNo: seed.containerNo,
      typeId: seed.typeId,
      status: 'GROUNDED',
      ownerName: seed.ownerName,
      grossWeightKg: seed.grossWeightKg,
      sealNo: seed.sealNo,
      eta: new Date(),
      placedAt: new Date(),
      currentSlotId: slot._id,
      notes: '',
    });
    slot.yardContainerId = container._id;
    await slot.save();
    placedContainers.push(container);
  }

  if (placedContainers.length >= 2) {
    const stackable = await Slot.findOne({
      yardId: yard._id,
      tier: 2,
      yardContainerId: null,
    });
    if (stackable) {
      const top = placedContainers[placedContainers.length - 1];
      stackable.yardContainerId = top._id;
      await stackable.save();
      top.currentSlotId = stackable._id;
      await top.save();
    }
  }

  console.log(`Yard: ${yard.code} (${slotDocs.length} slots, ${placedContainers.length} placed)`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Yard seed failed:', err);
  process.exit(1);
});
