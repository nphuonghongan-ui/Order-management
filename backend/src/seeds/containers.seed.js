import 'dotenv/config';
import mongoose from 'mongoose';

import Container from '../models/Container.js';

const SEED_DATA = [
  {
    typeId: '20GP',
    isoDesignation: '1CC',
    label: "20' Standard (Dry)",
    inner: { length: 586.7, width: 233.0, height: 235.0 },
    maxWeightKg: 30480,
    costFactor: 1.0,
  },
  {
    typeId: '40GP',
    isoDesignation: '1AA',
    label: "40' Standard (Dry)",
    inner: { length: 1199.8, width: 233.0, height: 235.0 },
    maxWeightKg: 30480,
    costFactor: 1.6,
  },
  {
    typeId: '40HC',
    isoDesignation: '1AAA',
    label: "40' High Cube (Dry)",
    inner: { length: 1199.8, width: 233.0, height: 265.5 },
    maxWeightKg: 30480,
    costFactor: 1.8,
  },
  {
    typeId: '45HC',
    isoDesignation: '1EEE',
    label: "45' High Cube (Dry)",
    inner: { length: 1354.2, width: 233.0, height: 265.5 },
    maxWeightKg: 30480,
    costFactor: 2.0,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/order-management';
  await mongoose.connect(uri);

  for (const entry of SEED_DATA) {
    await Container.findOneAndUpdate(
      { typeId: entry.typeId },
      { $set: entry },
      { upsert: true, new: true }
    );
    console.log(`Upserted ${entry.typeId}`);
  }

  console.log(`\nSeed complete: ${SEED_DATA.length} containers`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
