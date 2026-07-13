import Item from '../models/Item.js';

const toDate = (s) => {
  if (s === undefined || s === null || s === '') return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

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

export const listManufactureItems = async (req, res) => {
  const rawLimit = parseInt(req.query.limit, 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;

  const filter = {};

  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    filter.poNum = { $regex: `^${escapeRegex(req.query.q.trim())}`, $options: 'i' };
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

  const docs = await Item.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.createdAt, last._id) : null;

  return res.status(200).json({
    items: page.map(Item.toClient),
    nextCursor,
    hasMore,
  });
};

export const patchManufactureItem = async (req, res) => {
  const { id } = req.params;
  const { exWorkDate, quantityPerCont } = req.body || {};

  if (!('exWorkDate' in (req.body || {})) && !('quantityPerCont' in (req.body || {}))) {
    return res.status(400).json({ message: 'At least one of exWorkDate or quantityPerCont is required' });
  }

  const $set = {};

  if ('exWorkDate' in (req.body || {})) {
    const next = toOptionalDate(exWorkDate);
    if (exWorkDate !== null && exWorkDate !== '' && next === null) {
      return res.status(400).json({ message: 'exWorkDate must be a valid date or null' });
    }
    $set.exWorkDate = next;
  }

  if ('quantityPerCont' in (req.body || {})) {
    const n = typeof quantityPerCont === 'string' ? parseInt(quantityPerCont, 10) : quantityPerCont;
    if (!Number.isInteger(n) || n < 0) {
      return res.status(400).json({ message: 'quantityPerCont must be a non-negative integer' });
    }
    $set.quantityPerCont = n;
  }

  const updated = await Item.findOneAndUpdate(
    { _id: id },
    { $set },
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.status(200).json({ item: Item.toClient(updated) });
};
