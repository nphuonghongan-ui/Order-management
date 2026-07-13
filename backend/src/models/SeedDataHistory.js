import mongoose from 'mongoose';

const seedDataHistorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    runAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: false, collection: 'seed_data_histories' }
);

export default mongoose.model('SeedDataHistory', seedDataHistorySchema);
