import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Account from '../models/Account.js';
import { getIO, roomFor } from '../lib/socket.js';

const encodeCursor = (createdAt, _id) =>
  Buffer.from(JSON.stringify({ c: createdAt.getTime(), i: String(_id) })).toString('base64url');

const decodeCursor = (raw) => {
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (typeof parsed?.c !== 'number' || typeof parsed?.i !== 'string' || !parsed.i) {
      return null;
    }
    const date = new Date(parsed.c);
    if (Number.isNaN(date.getTime())) return null;
    return { createdAt: date, _id: parsed.i };
  } catch {
    return null;
  }
};

export const listMyNotifications = async (req, res) => {
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 50;

  const filter = { recipientCustomerCustId: req.user.customerCustId };
  if (req.query.unreadOnly === 'true') filter.read = false;

  if (req.query.cursor) {
    const decoded = decodeCursor(req.query.cursor);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid cursor' });
    }
    filter.$or = [
      { createdAt: { $lt: decoded.createdAt } },
      { createdAt: decoded.createdAt, _id: { $lt: decoded._id } },
    ];
  }

  const docs = await Notification.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last._id) : null;

  return res.status(200).json({
    items: page.map(Notification.toClient),
    nextCursor,
    hasMore,
    unreadCount: await Notification.countDocuments({
      recipientCustomerCustId: req.user.customerCustId,
      read: false,
    }),
  });
};

export const sendUrgeUpdate = async (req, res) => {
  const { recipientCustomerCustId, message, context } = req.body || {};

  if (typeof recipientCustomerCustId !== 'string' || !recipientCustomerCustId.trim()) {
    return res.status(400).json({ message: 'recipientCustomerCustId is required' });
  }

  const recipientCust = recipientCustomerCustId.trim().toUpperCase();
  const recipient = await Account.findOne({ customerCustId: recipientCust });
  if (!recipient) {
    return res.status(404).json({ message: 'Recipient customer not found' });
  }
  if (recipient.role !== 'Manufacture') {
    return res.status(400).json({ message: 'Recipient must have the Manufacture role' });
  }
  if (recipient.customerCustId === req.user.customerCustId) {
    return res.status(400).json({ message: 'Cannot notify your own account' });
  }

  const safeMessage = typeof message === 'string' ? message.trim().slice(0, 2000) : '';
  const safeContext = context && typeof context === 'object' ? {
    poNum: typeof context.poNum === 'string' ? context.poNum.trim().toUpperCase() : null,
    orderId: mongoose.isValidObjectId(context.orderId) ? context.orderId : null,
  } : { poNum: null, orderId: null };

  const created = await Notification.create({
    recipientCustomerCustId: recipient.customerCustId,
    recipientUserName: recipient.userName,
    fromCustomerCustId: req.user.customerCustId,
    fromUserName: req.user.userName,
    type: 'URGE_UPDATE_ORDERS',
    title: 'Please update orders',
    message: safeMessage,
    context: safeContext,
  });

  const io = getIO();
  if (io) {
    io.to(roomFor(recipient.customerCustId)).emit('notification:new', Notification.toClient(created));
  }

  return res.status(201).json({ item: Notification.toClient(created) });
};

export const markRead = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid notification id' });
  }

  const updated = await Notification.findOneAndUpdate(
    { _id: id, recipientCustomerCustId: req.user.customerCustId },
    { $set: { read: true } },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  return res.status(200).json({ item: Notification.toClient(updated) });
};

export const markAllRead = async (req, res) => {
  const result = await Notification.updateMany(
    { recipientCustomerCustId: req.user.customerCustId, read: false },
    { $set: { read: true } }
  );

  return res.status(200).json({ modified: result.modifiedCount ?? 0 });
};

export const listManufactureRecipients = async (_req, res) => {
  const docs = await Account.find({ role: 'Manufacture' })
    .select('customerCustId userName role')
    .sort({ customerCustId: 1 });

  return res.status(200).json({
    items: docs.map((d) => ({
      customerCustId: d.customerCustId,
      userName: d.userName,
      role: d.role,
    })),
  });
};
