import mongoose from 'mongoose';

const YARD_CONTAINER_STATUSES = [
  'IN_YARD',
  'GROUNDED',
  'LOADED',
  'OUT_GATED',
  'RESERVED',
];

const yardContainerSchema = new mongoose.Schema(
  {
    customerCustId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    containerNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    typeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ['20GP', '40GP', '40HC', '45HC'],
    },
    status: {
      type: String,
      required: true,
      enum: YARD_CONTAINER_STATUSES,
      default: 'IN_YARD',
      index: true,
    },
    ownerName: { type: String, default: '', trim: true },
    grossWeightKg: { type: Number, default: 0, min: 0 },
    sealNo: { type: String, default: '', trim: true },
    eta: { type: Date, default: null },
    placedAt: { type: Date, default: null },
    currentSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      default: null,
      index: true,
    },
    notes: { type: String, default: '', trim: true },
  },
  { timestamps: true, collection: 'yard_containers' }
);

yardContainerSchema.index(
  { customerCustId: 1, containerNo: 1 },
  { unique: true }
);

yardContainerSchema.statics.toClient = (doc) => ({
  _id: doc._id,
  customerCustId: doc.customerCustId,
  containerNo: doc.containerNo,
  typeId: doc.typeId,
  status: doc.status,
  ownerName: doc.ownerName ?? '',
  grossWeightKg: doc.grossWeightKg ?? 0,
  sealNo: doc.sealNo ?? '',
  eta: doc.eta ?? null,
  placedAt: doc.placedAt ?? null,
  currentSlotId: doc.currentSlotId ?? null,
  notes: doc.notes ?? '',
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export const YARD_CONTAINER_STATUS_VALUES = YARD_CONTAINER_STATUSES;

export default mongoose.model('YardContainer', yardContainerSchema);
