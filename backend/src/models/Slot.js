import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    customerCustId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    yardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Yard',
      required: true,
      index: true,
    },
    blockCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    row: { type: Number, required: true, min: 1 },
    col: { type: Number, required: true, min: 1 },
    tier: { type: Number, required: true, min: 1 },
    maxTier: { type: Number, required: true, min: 1, default: 1 },
    yardContainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'YardContainer',
      default: null,
      index: true,
    },
    isReserved: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'slots' }
);

slotSchema.index(
  { yardId: 1, blockCode: 1, row: 1, col: 1, tier: 1 },
  { unique: true }
);

slotSchema.statics.toClient = (doc) => ({
  _id: doc._id,
  customerCustId: doc.customerCustId,
  yardId: doc.yardId,
  blockCode: doc.blockCode,
  row: doc.row,
  col: doc.col,
  tier: doc.tier,
  maxTier: doc.maxTier,
  yardContainerId: doc.yardContainerId ?? null,
  isReserved: Boolean(doc.isReserved),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export default mongoose.model('Slot', slotSchema);
