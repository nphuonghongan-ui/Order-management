import mongoose from 'mongoose';

const dimensionSchema = new mongoose.Schema(
  {
    length: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 0 },
    height: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const partNumSchema = new mongoose.Schema(
  {
    no: { type: Number, required: true, min: 1 },
    partNum: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    dimension: { type: dimensionSchema, required: true },
  },
  { timestamps: true, collection: 'part_nums' }
);

partNumSchema.statics.toClient = (doc) => ({
  _id: doc._id,
  no: doc.no,
  partNum: doc.partNum,
  dimension: {
    length: doc.dimension.length,
    width: doc.dimension.width,
    height: doc.dimension.height,
  },
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export default mongoose.model('PartNum', partNumSchema);
