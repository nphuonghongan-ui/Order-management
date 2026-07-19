import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientCustomerCustId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    recipientUserName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fromCustomerCustId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    fromUserName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      default: 'URGE_UPDATE_ORDERS',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    context: {
      poNum: { type: String, default: null, trim: true, uppercase: true },
      orderId: { type: String, default: null },
      riskLines: {
        type: [
          {
            lineId: { type: String, default: null },
            poNum: {
              type: String,
              default: null,
              trim: true,
              uppercase: true,
            },
            partNum: {
              type: String,
              default: null,
              trim: true,
              uppercase: true,
            },
            pickedQty: { type: Number, default: 0 },
            quantityPerCont: { type: Number, default: 0 },
          },
        ],
        default: undefined,
      },
    },
  },
  { timestamps: true, collection: 'notifications' }
);

notificationSchema.index({ recipientCustomerCustId: 1, createdAt: -1, _id: -1 });
notificationSchema.index({ recipientCustomerCustId: 1, read: 1 });

notificationSchema.statics.toClient = (doc) => ({
  _id: doc._id,
  type: doc.type,
  title: doc.title,
  message: doc.message ?? '',
  read: doc.read,
  fromUserName: doc.fromUserName,
  fromCustomerCustId: doc.fromCustomerCustId,
  recipientCustomerCustId: doc.recipientCustomerCustId,
  recipientUserName: doc.recipientUserName,
  context: {
    poNum: doc.context?.poNum ?? null,
    orderId: doc.context?.orderId ?? null,
    riskLines: Array.isArray(doc.context?.riskLines)
      ? doc.context.riskLines.map((r) => ({
          lineId: r?.lineId ?? null,
          poNum: r?.poNum ?? null,
          partNum: r?.partNum ?? null,
          pickedQty: Number(r?.pickedQty) || 0,
          quantityPerCont: Number(r?.quantityPerCont) || 0,
        }))
      : [],
  },
  createdAt: doc.createdAt,
});

export default mongoose.model('Notification', notificationSchema);
