import 'dotenv/config';
import mongoose from 'mongoose';

import PartNum from '../models/PartNum.js';

const SEED_DATA = [
  { no: 1, partNum: 'RMS120.1', dimension: { length: 5, width: 5, height: 5 } },
  { no: 2, partNum: 'RMS121.1', dimension: { length: 3, width: 6, height: 6 } },
  { no: 3, partNum: 'RMS122.1', dimension: { length: 2, width: 3, height: 6 } },
  { no: 4, partNum: 'XMAFL040', dimension: { length: 6, width: 4, height: 5 } },
  { no: 5, partNum: 'XMAFL150', dimension: { length: 5, width: 5, height: 5 } },
  { no: 6, partNum: 'SCS01010', dimension: { length: 3, width: 4, height: 5 } },
];

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/order-management';
  await mongoose.connect(uri);

  for (const entry of SEED_DATA) {
    await PartNum.findOneAndUpdate(
      { partNum: entry.partNum },
      { $set: { no: entry.no, dimension: entry.dimension } },
      { upsert: true, new: true }
    );
    console.log(`Upserted ${entry.partNum}`);
  }

  console.log(`\nSeed complete: ${SEED_DATA.length} part numbers`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
