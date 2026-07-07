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
  if (toPositiveInt(line.quantityPerCont) == null) errors.quantityPerCont = 'Min 1';
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

  const poNums = lines.map((l) => l.poNum);
  if (new Set(poNums).size !== poNums.length) {
    return res.status(400).json({ message: 'Duplicate poNum within request' });
  }

  const existing = await Item.find({
    accountId: account._id,
    poNum: { $in: poNums },
  }).select('poNum');
  if (existing.length > 0) {
    return res.status(409).json({
      message: 'One or more PO numbers already exist',
      existingPoNums: existing.map((d) => d.poNum),
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
      quantityPerCont: parseInt(l.quantityPerCont, 10),
    };
  });

  try {
    const created = await Item.insertMany(docs, { ordered: true });
    return res.status(201).json({ created: created.map(Item.toClient) });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create PO lines', error: String(err) });
  }
};
