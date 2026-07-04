import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db.js';
import Account from '../models/Account.js';

const SEED = [
  { customerCustId: 'GRA', userName: 'GRA',   password: '123456', role: 'PO' },
  { customerCustId: 'DYL', userName: 'DYLAN', password: '234567', role: 'Sale' },
  { customerCustId: 'AIG', userName: 'AIGTH', password: '345678', role: 'Manufacture' },
];

const main = async () => {
  await connectDB();

  for (const row of SEED) {
    const hash = await bcrypt.hash(row.password, 10);
    const doc = await Account.findOneAndUpdate(
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
    console.log(`upserted ${doc.userName} (${doc.role}) -> ${doc.customerCustId}`);
  }

  await mongoose.disconnect();
  console.log('Seed accounts complete.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
