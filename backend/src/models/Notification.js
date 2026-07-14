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
  },
  createdAt: doc.createdAt,
});

export default mongoose.model('Notification', notificationSchema);
