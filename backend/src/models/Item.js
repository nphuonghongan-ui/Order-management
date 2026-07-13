import mongoose from 'mongoose';

const orderDtlSchema = new mongoose.Schema(
  {
    orderLine: { type: Number, required: true, min: 1 },
    partNum: { type: String, required: true, trim: true, uppercase: true },
    sellingQuantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    customerCustId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    poNum: { type: String, required: true, trim: true, index: true },
    shipToNum: { type: String, required: true, trim: true, index: true },
    needByDate: { type: Date, required: true },
    requestDate: { type: Date, required: true },
    mode: { type: String, required: true, enum: ['SEA', 'AIR', 'ROAD', 'RAIL'] },
    orderDtl: { type: orderDtlSchema, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    quantityPerCont: { type: Number, required: false, default: 0, min: 0 },
    exWorkDate: { type: Date, required: false, default: null },
  },
  { timestamps: true, collection: 'items' }
);

itemSchema.index({ createdAt: -1, _id: -1 });
itemSchema.index(
  { accountId: 1, poNum: 1, 'orderDtl.orderLine': 1 },
  { unique: true, name: 'uniq_account_po_line' }
);

itemSchema.statics.toClient = (doc) => ({
  _id: doc._id,
  customerCustId: doc.customerCustId,
  poNum: doc.poNum,
  shipToNum: doc.shipToNum,
  needByDate: doc.needByDate,
  requestDate: doc.requestDate,
  mode: doc.mode,
  orderDtl: doc.orderDtl,
  unitPrice: doc.unitPrice,
  total: doc.total,
  quantityPerCont: doc.quantityPerCont,
  exWorkDate: doc.exWorkDate ?? null,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export default mongoose.model('Item', itemSchema);