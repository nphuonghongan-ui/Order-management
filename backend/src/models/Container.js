import mongoose from 'mongoose';

/** Inner dimensions in centimetres (cm). */
const innerDimensionSchema = new mongoose.Schema(
  {
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const containerSchema = new mongoose.Schema(
  {
    typeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      enum: ['20GP', '40GP', '40HC', '45HC'],
    },
    isoDesignation: { type: String, trim: true },
    label: { type: String, required: true, trim: true },
    inner: { type: innerDimensionSchema, required: true },
    maxWeightKg: { type: Number, required: true, min: 0 },
    shellColor: { type: String, default: '#8b9bb4' },
    costFactor: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, collection: 'containers' }
);

containerSchema.statics.toClient = (doc) => ({
  _id: doc._id,
  typeId: doc.typeId,
  isoDesignation: doc.isoDesignation ?? null,
  label: doc.label,
  inner: {
    length: doc.inner.length,
    width: doc.inner.width,
    height: doc.inner.height,
  },
  maxWeightKg: doc.maxWeightKg,
  shellColor: doc.shellColor,
  costFactor: doc.costFactor,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export default mongoose.model('Container', containerSchema);
