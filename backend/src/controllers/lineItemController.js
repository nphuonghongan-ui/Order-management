import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Order from '../models/Order.js';
import PackingList from '../models/PackingList.js';

const MODE_VALUES = ['SEA', 'AIR', 'ROAD', 'RAIL'];

const toOptionalDate = (s) => {
  if (s === undefined) return undefined;
  if (s === null || s === '') return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

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

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listLineItems = async (req, res) => {
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;

  const filter = {};

  if (req.user.role === 'PO') {
    const account = await Account.findOne({ customerCustId: req.user.customerCustId });
    if (!account) {
      return res.status(200).json({ items: [], nextCursor: null, hasMore: false });
    }
    filter.accountId = account._id;
  }

  if (typeof req.query.customerCustId === 'string' && req.query.customerCustId.trim()) {
    filter.customerCustId = req.query.customerCustId.trim().toUpperCase();
  }

  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    filter.poNum = { $regex: `^${escapeRegex(req.query.q.trim())}`, $options: 'i' };
  }

  if (typeof req.query.mode === 'string' && MODE_VALUES.includes(req.query.mode)) {
    filter.mode = req.query.mode;
  }

  if (req.query.ready === 'true') {
    filter.exWorkDate = { $ne: null };
    filter.quantityPerCont = { $gt: 0 };
  }

  if (req.query.excludePacked === 'true') {
    const packedDocs = await PackingList.find({}, { 'items.lineId': 1 }).lean();
    const packedIds = [
      ...new Set(
        packedDocs.flatMap((pl) =>
          (pl.items || []).map((it) => String(it.lineId))
        )
      ),
    ];
    if (packedIds.length > 0) {
      filter._id = {
        $nin: packedIds.map((s) => new mongoose.Types.ObjectId(s)),
      };
    }
  }

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

  const docs = await Order.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last._id) : null;

  return res.status(200).json({
    items: page.map(Order.toClient),
    nextCursor,
    hasMore,
  });
};

export const updateLineItem = async (req, res) => {
  const { id } = req.params;
  const { exWorkDate } = req.body || {};
  const body = req.body || {};

  if (!('exWorkDate' in body)) {
    return res.status(400).json({ message: 'exWorkDate field is required' });
  }

  const next = toOptionalDate(exWorkDate);
  if (exWorkDate !== null && exWorkDate !== '' && next === null) {
    return res.status(400).json({ message: 'exWorkDate must be a valid date or null' });
  }

  const modifier = req.user?.customerCustId ?? null;

  const updated = await Order.findOneAndUpdate(
    { _id: id },
    { $set: { exWorkDate: next, exWorkDateModifiedBy: modifier } },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: 'Order not found' });
  }

  return res.status(200).json({ item: Order.toClient(updated) });
};
