import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    label: { type: String, required: true, trim: true },
    startRow: { type: Number, required: true, min: 1 },
    endRow: { type: Number, required: true, min: 1 },
    startCol: { type: Number, required: true, min: 1 },
    endCol: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const yardSchema = new mongoose.Schema(
  {
    customerCustId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    totalRows: { type: Number, required: true, min: 1 },
    totalCols: { type: Number, required: true, min: 1 },
    defaultMaxTier: { type: Number, required: true, min: 1, default: 1 },
    blocks: { type: [blockSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'yards' }
);

yardSchema.index({ customerCustId: 1, code: 1 }, { unique: true });

yardSchema.statics.toClient = (doc) => ({
  _id: doc._id,
  customerCustId: doc.customerCustId,
  name: doc.name,
  code: doc.code,
  totalRows: doc.totalRows,
  totalCols: doc.totalCols,
  defaultMaxTier: doc.defaultMaxTier,
  blocks: (doc.blocks ?? []).map((b) => ({
    code: b.code,
    label: b.label,
    startRow: b.startRow,
    endRow: b.endRow,
    startCol: b.startCol,
    endCol: b.endCol,
  })),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export default mongoose.model('Yard', yardSchema);
