import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Order from '../models/Order.js';
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

const buildOrderSellingMap = async (lineIds) => {
  if (!lineIds || lineIds.length === 0) return new Map();
  const objectIds = lineIds
    .map((id) => (typeof id === 'string' ? id : id?.toString?.()))
    .filter(isObjectId)
    .map((id) => new mongoose.Types.ObjectId(id));
  if (objectIds.length === 0) return new Map();
  const orders = await Order.find({ _id: { $in: objectIds } })
    .select('_id orderDtl.sellingQuantity');
  return new Map(
    orders.map((o) => [String(o._id), o.orderDtl?.sellingQuantity ?? 0])
  );
};

export const listPackingLists = async (_req, res) => {
  const docs = await PackingList.find().sort({ createdAt: -1, _id: -1 });
  const allLineIds = [
    ...new Set(docs.flatMap((d) => d.items.map((it) => String(it.lineId)))),
  ];
  const orderSellingByLineId = await buildOrderSellingMap(allLineIds);
  return res.status(200).json({
    lists: docs.map((d) => PackingList.toClient(d, orderSellingByLineId)),
  });
};

export const getPackingList = async (req, res) => {
  const doc = await PackingList.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ message: 'Packing list not found' });
  }
  const lineIds = doc.items.map((it) => String(it.lineId));
  const orderSellingByLineId = await buildOrderSellingMap(lineIds);
  return res.status(200).json({ list: PackingList.toClient(doc, orderSellingByLineId) });
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
  const found = await Order.find({ _id: { $in: objectIds } }).select(
    '_id orderDtl.sellingQuantity'
  );
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

  const requestedByLine = new Map();
  for (const it of items) {
    if (!isObjectId(it.lineId)) continue;
    const qty = toPositiveInt(it.qty) || 0;
    requestedByLine.set(
      String(it.lineId),
      (requestedByLine.get(String(it.lineId)) || 0) + qty
    );
  }

  const packedAgg = await PackingList.aggregate([
    { $unwind: '$items' },
    { $match: { 'items.lineId': { $in: objectIds } } },
    { $group: { _id: '$items.lineId', packedQty: { $sum: '$items.qty' } } },
  ]);
  const packedByLine = new Map(
    packedAgg.map((p) => [String(p._id), p.packedQty || 0])
  );

  const sellingByLine = new Map(
    found.map((d) => [String(d._id), d.orderDtl?.sellingQuantity ?? 0])
  );

  const overPacked = [];
  for (const [lineId, requestedQty] of requestedByLine.entries()) {
    const soldQty = sellingByLine.get(lineId) ?? 0;
    if (requestedQty > soldQty) {
      overPacked.push({
        lineId,
        sellingQuantity: soldQty,
        alreadyPacked: packedByLine.get(lineId) || 0,
        requested: requestedQty,
      });
    }
  }
  if (overPacked.length > 0) {
    return res.status(400).json({
      message: 'One or more lineIds exceed remaining quantity',
      overPacked,
    });
  }

  const plNumber = `PL-${account.customerCustId}-${Date.now()}`;

  const itemsCount = items.length;
  const total = items.reduce(
    (s, it) => s + toPositiveInt(it.qty) * toNonNegNumber(it.unitPrice),
    0
  );

  const decByLine = new Map();
  for (const it of items) {
    if (!isObjectId(it.lineId)) continue;
    const qty = toPositiveInt(it.qty) || 0;
    if (qty <= 0) continue;
    const k = String(it.lineId);
    decByLine.set(k, (decByLine.get(k) || 0) + qty);
  }

  const session = await mongoose.startSession();
  try {
    let createdDoc;
    await session.withTransaction(async () => {
      const docs = await PackingList.create(
        [
          {
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
          },
        ],
        { session }
      );
      createdDoc = docs[0];

      if (decByLine.size > 0) {
        const ops = Array.from(decByLine.entries()).map(([lineId, qty]) => ({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(lineId) },
            update: { $inc: { 'orderDtl.sellingQuantity': -qty } },
          },
        }));
        await Order.bulkWrite(ops, { session });
      }
    });

    const createdLineIds = createdDoc.items.map((it) => String(it.lineId));
    const orderSellingByLineId = await buildOrderSellingMap(createdLineIds);
    return res.status(201).json({ list: PackingList.toClient(createdDoc, orderSellingByLineId) });
  } catch (err) {
    if (err && err.code === 11000) {
      return res
        .status(409)
        .json({ message: `PL number already exists: ${plNumber}` });
    }
    return res
      .status(500)
      .json({ message: 'Failed to create packing list', error: String(err) });
  } finally {
    await session.endSession();
  }
};

export const deletePackingList = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const pl = await PackingList.findById(req.params.id).session(session);
      if (!pl) {
        const err = new Error('Packing list not found');
        err.status = 404;
        throw err;
      }
      const items = pl.items;

      await PackingList.deleteOne({ _id: req.params.id }, { session });

      const incByLine = new Map();
      for (const it of items) {
        if (!it || !it.lineId) continue;
        const qty = Number(it.qty) || 0;
        if (qty <= 0) continue;
        const k = String(it.lineId);
        incByLine.set(k, (incByLine.get(k) || 0) + qty);
      }
      if (incByLine.size > 0) {
        const ops = Array.from(incByLine.entries()).map(([lineId, qty]) => ({
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(lineId) },
            update: { $inc: { 'orderDtl.sellingQuantity': qty } },
          },
        }));
        await Order.bulkWrite(ops, { session });
      }
    });
    return res.status(200).json({ message: 'Packing list deleted' });
  } catch (err) {
    if (err && err.status === 404) {
      return res.status(404).json({ message: 'Packing list not found' });
    }
    return res
      .status(500)
      .json({ message: 'Failed to delete packing list', error: String(err) });
  } finally {
    await session.endSession();
  }
};

export const updatePackingList = async (req, res) => {
  const { id } = req.params;
  const { operations } = req.body || {};

  if (!Array.isArray(operations) || operations.length === 0) {
    return res.status(400).json({ message: 'operations array is required' });
  }

  const opErrors = [];
  operations.forEach((op, i) => {
    if (!op || typeof op !== 'object') {
      opErrors.push({ index: i, message: 'Invalid operation' });
      return;
    }
    if (op.op === 'set_qty') {
      if (!isObjectId(op.lineId)) opErrors.push({ index: i, message: 'Invalid lineId' });
      if (toPositiveInt(op.qty) == null) opErrors.push({ index: i, message: 'Invalid qty' });
    } else if (op.op === 'set_customer') {
      const errs = validateCustomer(op);
      if (Object.keys(errs).length > 0) {
        opErrors.push({ index: i, field: 'customer', errors: errs });
      }
    } else if (op.op === 'set_delivery') {
      const errs = validateDelivery(op);
      if (Object.keys(errs).length > 0) {
        opErrors.push({ index: i, field: 'delivery', errors: errs });
      }
    } else {
      opErrors.push({ index: i, message: `Unknown op: ${op.op}` });
    }
  });
  if (opErrors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', opErrors });
  }

  const session = await mongoose.startSession();
  try {
    let updatedDoc;
    await session.withTransaction(async () => {
      const pl = await PackingList.findById(id).session(session);
      if (!pl) {
        const err = new Error('Packing list not found');
        err.status = 404;
        throw err;
      }

      const initialQty = new Map(pl.items.map((it) => [String(it.lineId), it.qty]));

      const targetLineIds = [
        ...new Set(
          operations
            .filter((o) => o.op === 'set_qty')
            .map((o) => String(o.lineId))
        ),
      ];

      const orders =
        targetLineIds.length > 0
          ? await Order.find({
              _id: {
                $in: targetLineIds.map((lid) => new mongoose.Types.ObjectId(lid)),
              },
            })
              .select('_id orderDtl.sellingQuantity')
              .session(session)
          : [];
      const orderById = new Map(orders.map((o) => [String(o._id), o]));

      for (const lineId of targetLineIds) {
        const order = orderById.get(lineId);
        if (!order) {
          const err = new Error(`Order not found for lineId ${lineId}`);
          err.status = 400;
          throw err;
        }
        const initQ = initialQty.get(lineId);
        if (initQ === undefined) {
          const err = new Error(`lineId ${lineId} is not in this packing list`);
          err.status = 400;
          throw err;
        }
        const qtyOps = operations.filter(
          (o) => o.op === 'set_qty' && String(o.lineId) === lineId
        );
        const lastQty = toPositiveInt(qtyOps[qtyOps.length - 1].qty);
        if (lastQty > order.orderDtl.sellingQuantity + initQ) {
          const err = new Error(
            `Over-pack for lineId ${lineId}: requested ${lastQty}, available ${
              order.orderDtl.sellingQuantity + initQ
            }`
          );
          err.status = 400;
          throw err;
        }
      }

      const items = pl.items.map((it) => it.toObject());
      let customer = pl.customer.toObject();
      let delivery = pl.delivery.toObject();

      for (const op of operations) {
        if (op.op === 'set_qty') {
          const idx = items.findIndex(
            (it) => String(it.lineId) === String(op.lineId)
          );
          const oldQty = items[idx].qty;
          const newQty = toPositiveInt(op.qty);
          if (newQty === oldQty) continue;
          const diff = oldQty - newQty;
          items[idx].qty = newQty;
          await Order.updateOne(
            { _id: op.lineId },
            { $inc: { 'orderDtl.sellingQuantity': diff } },
            { session }
          );
        } else if (op.op === 'set_customer') {
          customer = {
            name: toStr(op.name),
            address: toStr(op.address),
            contact: toStr(op.contact),
            email: toStr(op.email).toLowerCase(),
          };
        } else if (op.op === 'set_delivery') {
          delivery = {
            name: toStr(op.name),
            address: toStr(op.address),
            shipDate: toDate(op.shipDate),
            notes: toStr(op.notes),
          };
        }
      }

      const itemsCount = items.length;
      const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
      pl.set({ customer, delivery, items, itemsCount, total });
      await pl.save({ session });
      updatedDoc = pl;
    });

    const lineIds = updatedDoc.items.map((it) => String(it.lineId));
    const orderSellingByLineId = await buildOrderSellingMap(lineIds);
    return res
      .status(200)
      .json({ list: PackingList.toClient(updatedDoc, orderSellingByLineId) });
  } catch (err) {
    if (err && err.status === 404) {
      return res.status(404).json({ message: 'Packing list not found' });
    }
    if (err && err.status === 400) {
      return res.status(400).json({ message: err.message });
    }
    return res
      .status(500)
      .json({ message: 'Failed to update packing list', error: String(err) });
  } finally {
    await session.endSession();
  }
};