import Account from '../models/Account.js';
import Item from '../models/Item.js';

const MODE_VALUES = ['SEA', 'AIR', 'ROAD', 'RAIL'];

const toPositiveInt = (v, min = 1) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return Number.isInteger(n) && n >= min ? n : null;
};

const toNonNegNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const toDate = (s) => {
  if (s === undefined || s === null || s === '') return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const upper = (s) => (typeof s === 'string' ? s.trim().toUpperCase() : s);

const validateLine = (line) => {
  const errors = {};
  if (!line || typeof line !== 'object') return { _root: 'Invalid line' };
  if (!line.poNum || !String(line.poNum).trim()) errors.poNum = 'Required';
  if (!line.shipToNum || !String(line.shipToNum).trim()) errors.shipToNum = 'Required';
  if (!toDate(line.needByDate)) errors.needByDate = 'Invalid date';
  if (!toDate(line.requestDate)) errors.requestDate = 'Invalid date';
  if (!MODE_VALUES.includes(line.mode)) errors.mode = 'Invalid mode';
  if (!line.orderDtl || typeof line.orderDtl !== 'object') {
    errors['orderDtl'] = 'Required';
  } else {
    if (!line.orderDtl.partNum || !String(line.orderDtl.partNum).trim())
      errors['orderDtl.partNum'] = 'Required';
    if (toPositiveInt(line.orderDtl.orderLine) == null)
      errors['orderDtl.orderLine'] = 'Min 1';
    if (toPositiveInt(line.orderDtl.sellingQuantity) == null)
      errors['orderDtl.sellingQuantity'] = 'Min 1';
  }
  if (toNonNegNumber(line.unitPrice) == null) errors.unitPrice = 'Required';
  if (line.quantityPerCont !== undefined && line.quantityPerCont !== '') {
    if (toPositiveInt(line.quantityPerCont, 0) == null) errors.quantityPerCont = 'Min 0';
  }
  return errors;
};

export const createPO = async (req, res) => {
  const { lines } = req.body || {};
  if (!Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ message: 'lines must be a non-empty array' });
  }

  const account = await Account.findOne({ customerCustId: req.user.customerCustId });
  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }

  const perLineErrors = lines.map(validateLine);
  if (perLineErrors.some((e) => Object.keys(e).length > 0)) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: perLineErrors,
    });
  }

  const pairKey = (l) => `${String(l.poNum).trim()}::${parseInt(l.orderDtl.orderLine, 10)}`;
  const pairCounts = new Map();
  for (const l of lines) {
    const k = pairKey(l);
    pairCounts.set(k, (pairCounts.get(k) || 0) + 1);
  }
  const dupPairs = [...pairCounts.entries()].filter(([, n]) => n > 1).map(([k]) => {
    const [poNum, orderLine] = k.split('::');
    return { poNum, orderLine: Number(orderLine) };
  });
  if (dupPairs.length > 0) {
    return res.status(400).json({
      message: 'Duplicate (poNum, orderLine) within request',
      duplicatePairs: dupPairs,
    });
  }

  const orClauses = lines.map((l) => ({
    poNum: String(l.poNum).trim(),
    'orderDtl.orderLine': parseInt(l.orderDtl.orderLine, 10),
  }));
  const existing = await Item.find({
    accountId: account._id,
    $or: orClauses,
  }).select('poNum orderDtl.orderLine');
  if (existing.length > 0) {
    return res.status(409).json({
      message: 'One or more (poNum, orderLine) pairs already exist',
      existingPairs: existing.map((d) => ({
        poNum: d.poNum,
        orderLine: d.orderDtl.orderLine,
      })),
    });
  }

  const docs = lines.map((l) => {
    const qty = parseInt(l.orderDtl.sellingQuantity, 10);
    const price = parseFloat(l.unitPrice);
    return {
      accountId: account._id,
      customerCustId: account.customerCustId,
      poNum: String(l.poNum).trim(),
      shipToNum: upper(l.shipToNum),
      needByDate: toDate(l.needByDate),
      requestDate: toDate(l.requestDate),
      mode: l.mode,
      orderDtl: {
        orderLine: parseInt(l.orderDtl.orderLine, 10),
        partNum: upper(l.orderDtl.partNum),
        sellingQuantity: qty,
      },
      unitPrice: price,
      total: qty * price,
      quantityPerCont: parseInt(l.quantityPerCont, 10) || 0,
    };
  });

  try {
    const created = await Item.insertMany(docs, { ordered: true });
    return res.status(201).json({ created: created.map(Item.toClient) });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create PO lines', error: String(err) });
  }
};

export const getNextPONum = async (req, res) => {
  const account = await Account.findOne({ customerCustId: req.user.customerCustId });
  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }

  // Lazy init: if counter is at default (0 or undefined), skip past any
  // existing POs with the new POSRS-{5-digit}-{ts} format. Old-format POs
  // (POSRS0xxxx) are structurally distinct and ignored.
  if (!account.poCounter) {
    const maxExisting = await Item.findOne({
      accountId: account._id,
      poNum: { $regex: /^POSRS-\d{5}-/ },
    })
      .sort({ poNum: -1 })
      .select('poNum')
      .lean();
    let maxNum = 0;
    if (maxExisting) {
      const m = /^POSRS-(\d{5})-/.exec(maxExisting.poNum);
      if (m) maxNum = parseInt(m[1], 10);
    }
    const updated = await Account.findOneAndUpdate(
      { _id: account._id, $or: [{ poCounter: { $exists: false } }, { poCounter: 0 }] },
      { $set: { poCounter: maxNum } },
      { new: true }
    );
    if (updated) account.poCounter = updated.poCounter;
  }

  const updated = await Account.findOneAndUpdate(
    { _id: account._id },
    { $inc: { poCounter: 1 } },
    { new: true }
  );

  const timestamp = Date.now();
  const paddedCounter = String(updated.poCounter).padStart(5, '0');
  return res.status(200).json({ poNum: `POSRS-${paddedCounter}-${timestamp}` });
};
