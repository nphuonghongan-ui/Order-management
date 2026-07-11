import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Item from '../models/Item.js';
import PackingList from '../models/PackingList.js';

const MODE_VALUES = ['SEA', 'AIR', 'ROAD', 'RAIL'];

const toStr = (v) => (typeof v === 'string' ? v.trim() : '');

const toUpper = (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v);

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

const isObjectId = (s) =>
  s != null && mongoose.Types.ObjectId.isValid(String(s));

const validateCustomer = (c) => {
  const errors = {};
  if (!c || typeof c !== 'object') return { _root: 'Invalid customer' };
  if (!toStr(c.name)) errors.name = 'Required';
  if (!toStr(c.address)) errors.address = 'Required';
  return errors;
};

const validateDelivery = (d) => {
  const errors = {};
  if (!d || typeof d !== 'object') return { _root: 'Invalid delivery' };
  if (!toStr(d.name)) errors.name = 'Required';
  if (!toStr(d.address)) errors.address = 'Required';
  if (
    'shipDate' in d &&
    d.shipDate !== null &&
    d.shipDate !== '' &&
    !toDate(d.shipDate)
  ) {
    errors.shipDate = 'Invalid date';
  }
  return errors;
};

const validateItem = (it) => {
  const errors = {};
  if (!it || typeof it !== 'object') return { _root: 'Invalid item' };
  if (!isObjectId(it.lineId)) errors.lineId = 'Invalid lineId';
  if (!toStr(it.poNum)) errors.poNum = 'Required';
  if (!toStr(it.partNum)) errors.partNum = 'Required';
  if (!toStr(it.shipToNum)) errors.shipToNum = 'Required';
  if (!MODE_VALUES.includes(it.mode)) errors.mode = 'Invalid mode';
  if (toPositiveInt(it.qty) == null) errors.qty = 'Min 1';
  if (toNonNegNumber(it.unitPrice) == null) errors.unitPrice = 'Required';
  return errors;
};

const flattenErrors = (errors) => {
  const entries = Object.entries(errors);
  return entries.length === 0 ? null : Object.fromEntries(entries);
};

export const listPackingLists = async (_req, res) => {
  const docs = await PackingList.find().sort({ createdAt: -1, _id: -1 });
  return res.status(200).json({ lists: docs.map(PackingList.toClient) });
};

export const getPackingList = async (req, res) => {
  const doc = await PackingList.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ message: 'Packing list not found' });
  }
  return res.status(200).json({ list: PackingList.toClient(doc) });
};

export const createPackingList = async (req, res) => {
  const { customer, delivery, items } = req.body || {};

  if (
    !customer ||
    typeof customer !== 'object' ||
    !delivery ||
    typeof delivery !== 'object' ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      message: 'customer, delivery, and a non-empty items array are required',
    });
  }

  const customerErrors = validateCustomer(customer);
  const deliveryErrors = validateDelivery(delivery);
  const itemsErrors = items.map(validateItem);

  const errors = [];
  const c = flattenErrors(customerErrors);
  if (c) errors.push({ field: 'customer', ...c });
  const d = flattenErrors(deliveryErrors);
  if (d) errors.push({ field: 'delivery', ...d });
  itemsErrors.forEach((e, idx) => {
    const flat = flattenErrors(e);
    if (flat) errors.push({ field: `items[${idx}]`, ...flat });
  });

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const account = await Account.findOne({
    customerCustId: req.user.customerCustId,
  });
  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }

  const objectIds = items.map((it) => it.lineId).filter(isObjectId);
  const found = await Item.find({ _id: { $in: objectIds } }).select('_id');
  if (found.length !== objectIds.length) {
    const foundIds = new Set(found.map((doc) => String(doc._id)));
    const missing = items
      .filter((it) => isObjectId(it.lineId) && !foundIds.has(String(it.lineId)))
      .map((it) => it.lineId);
    return res.status(400).json({
      message: 'One or more lineIds do not exist',
      missing,
    });
  }

  const plNumber = `PL-${account.customerCustId}-${Date.now()}`;

  const itemsCount = items.length;
  const total = items.reduce(
    (s, it) => s + toPositiveInt(it.qty) * toNonNegNumber(it.unitPrice),
    0
  );

  try {
    const doc = await PackingList.create({
      accountId: account._id,
      plNumber,
      customer: {
        name: toStr(customer.name),
        address: toStr(customer.address),
        contact: toStr(customer.contact),
        email: toStr(customer.email).toLowerCase(),
      },
      delivery: {
        name: toStr(delivery.name),
        address: toStr(delivery.address),
        shipDate: toDate(delivery.shipDate),
        notes: toStr(delivery.notes),
      },
      items: items.map((it) => ({
        lineId: it.lineId,
        poNum: toUpper(it.poNum),
        partNum: toUpper(it.partNum),
        shipToNum: toUpper(it.shipToNum),
        mode: it.mode,
        qty: toPositiveInt(it.qty),
        unitPrice: toNonNegNumber(it.unitPrice),
      })),
      itemsCount,
      total,
    });

    return res.status(201).json({ list: PackingList.toClient(doc) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res
        .status(409)
        .json({ message: `PL number already exists: ${plNumber}` });
    }
    return res
      .status(500)
      .json({ message: 'Failed to create packing list', error: String(err) });
  }
};

export const deletePackingList = async (req, res) => {
  const result = await PackingList.findByIdAndDelete(req.params.id);
  if (!result) {
    return res.status(404).json({ message: 'Packing list not found' });
  }
  return res.status(200).json({ message: 'Packing list deleted' });
};