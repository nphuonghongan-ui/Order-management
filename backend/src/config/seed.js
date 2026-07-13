import bcrypt from 'bcrypt';
import Account from '../models/Account.js';
import PartNum from '../models/PartNum.js';
import SeedDataHistory from '../models/SeedDataHistory.js';

const ACCOUNTS = [
  { customerCustId: 'GRA', userName: 'GRA', password: '123456', role: 'PO' },
  { customerCustId: 'DYL', userName: 'DYLAN', password: '234567', role: 'Sale' },
  { customerCustId: 'AIG', userName: 'AIGTH', password: '345678', role: 'Manufacture' },
];

const PART_NUMS = [
  { no: 1, partNum: 'RMS120.1', dimension: { length: 5, width: 5, height: 5 } },
  { no: 2, partNum: 'RMS121.1', dimension: { length: 3, width: 6, height: 6 } },
  { no: 3, partNum: 'RMS122.1', dimension: { length: 2, width: 3, height: 6 } },
  { no: 4, partNum: 'XMAFL040', dimension: { length: 6, width: 4, height: 5 } },
  { no: 5, partNum: 'XMAFL150', dimension: { length: 5, width: 5, height: 5 } },
  { no: 6, partNum: 'SCS01010', dimension: { length: 3, width: 4, height: 5 } },
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
    const hash = await bcrypt.hash(row.password, 10);
    await Account.findOneAndUpdate(
      { userName: row.userName },
      {
        $set: {
          customerCustId: row.customerCustId,
          role: row.role,
          password: hash,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  }
}

async function seedPartNums() {
  for (const entry of PART_NUMS) {
    await PartNum.findOneAndUpdate(
      { partNum: entry.partNum },
      { $set: { no: entry.no, dimension: entry.dimension } },
      { upsert: true, returnDocument: 'after' }
    );
  }
}

export async function autoSeed() {
  await runSeedIfNeeded('accounts', seedAccounts);
  await runSeedIfNeeded('part_nums', seedPartNums);
}
