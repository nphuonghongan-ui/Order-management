import mongoose from 'mongoose';
import Yard from '../models/Yard.js';

const toStr = (v) => (typeof v === 'string' ? v.trim() : '');
const toUpper = (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v);
const toPosInt = (v, min = 1) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return Number.isInteger(n) && n >= min ? n : null;
};

export const listYards = async (req, res) => {
  const docs = await Yard.find({
    customerCustId: req.user.customerCustId,
    isDeleted: { $ne: true },
  }).sort({ code: 1 });
  return res.status(200).json({ items: docs.map(Yard.toClient) });
};

export const getYard = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid yard id' });
  }
  const doc = await Yard.findOne({
    _id: id,
    customerCustId: req.user.customerCustId,
    isDeleted: { $ne: true },
  });
  if (!doc) return res.status(404).json({ message: 'Yard not found' });
  return res.status(200).json({ item: Yard.toClient(doc) });
};

export const createYard = async (req, res) => {
  const body = req.body || {};
  const name = toStr(body.name);
  const code = toUpper(body.code);
  const totalRows = toPosInt(body.totalRows);
  const totalCols = toPosInt(body.totalCols);
  const defaultMaxTier = toPosInt(body.defaultMaxTier, 1) ?? 1;
  const blocksRaw = Array.isArray(body.blocks) ? body.blocks : [];

  const errors = {};
  if (!name) errors.name = 'Required';
  if (!code) errors.code = 'Required';
  if (!totalRows) errors.totalRows = 'Must be a positive integer';
  if (!totalCols) errors.totalCols = 'Must be a positive integer';

  const blocks = [];
  for (let i = 0; i < blocksRaw.length; i += 1) {
    const b = blocksRaw[i] || {};
    const bCode = toUpper(b.code);
    const bLabel = toStr(b.label);
    const bStartRow = toPosInt(b.startRow);
    const bEndRow = toPosInt(b.endRow);
    const bStartCol = toPosInt(b.startCol);
    const bEndCol = toPosInt(b.endCol);
    const bErr = {};
    if (!bCode) bErr.code = 'Required';
    if (!bLabel) bErr.label = 'Required';
    if (!bStartRow) bErr.startRow = 'Must be a positive integer';
    if (!bEndRow) bErr.endRow = 'Must be a positive integer';
    if (!bStartCol) bErr.startCol = 'Must be a positive integer';
    if (!bEndCol) bErr.endCol = 'Must be a positive integer';
    if (
      bStartRow &&
      bEndRow &&
      bStartRow > bEndRow
    ) bErr.range = 'startRow must be <= endRow';
    if (
      bStartCol &&
      bEndCol &&
      bStartCol > bEndCol
    ) bErr.range = 'startCol must be <= endCol';
    if (Object.keys(bErr).length) errors[`blocks[${i}]`] = bErr;
    else blocks.push({
      code: bCode,
      label: bLabel,
      startRow: bStartRow,
      endRow: bEndRow,
      startCol: bStartCol,
      endCol: bEndCol,
    });
  }

  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const existing = await Yard.findOne({
    customerCustId: req.user.customerCustId,
    code,
  });
  if (existing) {
    return res.status(409).json({ message: 'Yard code already exists' });
  }

  const created = await Yard.create({
    customerCustId: req.user.customerCustId,
    name,
    code,
    totalRows,
    totalCols,
    defaultMaxTier,
    blocks,
  });

  return res.status(201).json({ item: Yard.toClient(created) });
};
