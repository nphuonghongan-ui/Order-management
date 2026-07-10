import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const accountSchema = new mongoose.Schema(
  {
    customerCustId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ['PO', 'Sale', 'Manufacture'],
    },
    poCounter: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, collection: 'accounts' }
);

accountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

accountSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

accountSchema.statics.toProfile = (doc) => ({
  customerCustId: doc.customerCustId,
  userName: doc.userName,
  role: doc.role,
});

export default mongoose.model('Account', accountSchema);
