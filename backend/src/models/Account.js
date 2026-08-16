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
      required: false,
      minlength: 6,
      select: false,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    googleSub: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      index: true,
    },
    authProvider: {
      type: String,
      required: true,
      enum: ['local', 'google', 'both'],
      default: 'local',
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

accountSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

accountSchema.methods.comparePassword = function (plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

accountSchema.statics.toProfile = (doc) => ({
  customerCustId: doc.customerCustId,
  userName: doc.userName,
  role: doc.role,
  authProvider: doc.authProvider,
  email: doc.email || null,
});

export default mongoose.model('Account', accountSchema);
