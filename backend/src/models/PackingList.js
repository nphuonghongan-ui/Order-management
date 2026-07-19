import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contact: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true, lowercase: true },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    shipDate: { type: Date, default: null },
    notes: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const packingListItemSchema = new mongoose.Schema(
  {
    lineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    poNum: { type: String, required: true, trim: true, uppercase: true },
    partNum: { type: String, required: true, trim: true, uppercase: true },
    shipToNum: { type: String, required: true, trim: true, uppercase: true },
    mode: {
      type: String,
      required: true,
      enum: ['SEA', 'AIR', 'ROAD', 'RAIL'],
    },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const packingListSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    plNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: { type: customerSchema, required: true },
    delivery: { type: deliverySchema, required: true },
    items: {
      type: [packingListItemSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'items must be a non-empty array',
      },
    },
    itemsCount: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, collection: 'packing_lists' }
);

packingListSchema.index({ createdAt: -1, _id: -1 });
packingListSchema.index({ 'items.lineId': 1 });

packingListSchema.statics.toClient = (doc, orderSellingByLineId = new Map()) => ({
  _id: doc._id,
  plNumber: doc.plNumber,
  customer: {
    name: doc.customer.name,
    address: doc.customer.address,
    contact: doc.customer.contact ?? '',
    email: doc.customer.email ?? '',
  },
  delivery: {
    name: doc.delivery.name,
    address: doc.delivery.address,
    shipDate: doc.delivery.shipDate
      ? doc.delivery.shipDate.toISOString().slice(0, 10)
      : '',
    notes: doc.delivery.notes ?? '',
  },
  items: doc.items.map((it) => {
    const meta = orderSellingByLineId.get(String(it.lineId));
    return {
      lineId: it.lineId,
      poNum: it.poNum,
      partNum: it.partNum,
      shipToNum: it.shipToNum,
      mode: it.mode,
      qty: it.qty,
      unitPrice: it.unitPrice,
      currentSellingQty: meta?.sellingQuantity ?? 0,
      quantityPerCont: meta?.quantityPerCont ?? 0,
    };
  }),
  itemsCount: doc.itemsCount,
  total: doc.total,
  createdAt: doc.createdAt,
});

export default mongoose.model('PackingList', packingListSchema);