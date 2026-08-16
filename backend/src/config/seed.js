import bcrypt from 'bcrypt';
import Account from '../models/Account.js';
import PartNum from '../models/PartNum.js';
import Container from '../models/Container.js';
import SeedDataHistory from '../models/SeedDataHistory.js';

const ACCOUNTS = [
  { customerCustId: 'GRA', userName: 'GRA', password: '123456', role: 'PO' },
  { customerCustId: 'DYL', userName: 'DYLAN', password: '234567', role: 'Sale' },
  { customerCustId: 'AIG', userName: 'AIGTH', password: '345678', role: 'Manufacture' },
  // Example Google-One-Tap-provisioned PO. The `email` must match the Google account
  // that will sign in. `password` is empty (the schema and pre-save hook handle this).
  // {
  //   customerCustId: 'EXT-PO-001',
  //   userName: 'ext-po-001',
  //   email: 'po1@example.com',
  //   password: '',
  //   role: 'PO',
  //   authProvider: 'google',
  // },
];

// Dimensions in centimetres (cm).
const PART_NUMS = [
  { no: 1, partNum: 'RMS120.1', dimension: { length: 5, width: 5, height: 5 }, weightKg: 2 },
  { no: 2, partNum: 'RMS121.1', dimension: { length: 3, width: 6, height: 6 }, weightKg: 4 },
  { no: 3, partNum: 'RMS122.1', dimension: { length: 2, width: 3, height: 6 }, weightKg: 6 },
  { no: 4, partNum: 'XMAFL040', dimension: { length: 6, width: 4, height: 5 }, weightKg: 1.5 },
  { no: 5, partNum: 'XMAFL150', dimension: { length: 5, width: 5, height: 5 }, weightKg: 10 },
  { no: 6, partNum: 'SCS01010', dimension: { length: 3, width: 4, height: 5 }, weightKg: 4.5 },
];

const CONTAINERS = [
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

async function runSeedIfNeeded(name, run) {
  const already = await SeedDataHistory.findOne({ name });
  if (already) {
    console.log(`[seed] skip "${name}" (already run at ${already.runAt.toISOString()})`);
    return;
  }
  console.log(`[seed] running "${name}"...`);
  await run();
  await SeedDataHistory.create({ name, runAt: new Date() });
  console.log(`[seed] done "${name}"`);
}

async function seedAccounts() {
  for (const row of ACCOUNTS) {
    const update = {
      customerCustId: row.customerCustId,
      role: row.role,
    };
    if (row.password) {
      update.password = await bcrypt.hash(row.password, 10);
    }
    if (row.email) {
      update.email = row.email;
    }
    if (row.authProvider) {
      update.authProvider = row.authProvider;
    }
    await Account.findOneAndUpdate(
      { userName: row.userName },
      { $set: update },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }
}

async function seedPartNums() {
  for (const entry of PART_NUMS) {
    await PartNum.findOneAndUpdate(
      { partNum: entry.partNum },
      { $set: { no: entry.no, dimension: entry.dimension, weightKg: entry.weightKg } },
      { upsert: true, returnDocument: 'after' }
    );
  }
}

async function seedContainers() {
  for (const entry of CONTAINERS) {
    await Container.findOneAndUpdate(
      { typeId: entry.typeId },
      { $set: entry },
      { upsert: true, returnDocument: 'after' }
    );
  }
}

export async function autoSeed() {
  await runSeedIfNeeded('accounts', seedAccounts);
  await runSeedIfNeeded('part_nums', seedPartNums);
  await runSeedIfNeeded('containers', seedContainers);
}
