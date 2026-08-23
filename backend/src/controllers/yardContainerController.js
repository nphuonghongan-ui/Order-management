import mongoose from 'mongoose';
import Yard from '../models/Yard.js';
import Slot from '../models/Slot.js';
import YardContainer, {
  YARD_CONTAINER_STATUS_VALUES,
} from '../models/YardContainer.js';
import { getIO, roomFor } from '../lib/socket.js';

const toStr = (v) => (typeof v === 'string' ? v.trim() : '');
const toUpper = (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v);
const toPosInt = (v, min = 1) => {
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
const isObjectId = (s) => s != null && mongoose.Types.ObjectId.isValid(String(s));

const emitUpdate = (custId, payload) => {
  const io = getIO();
  if (io) io.to(roomFor(custId)).emit('yard:update', payload);
};

export const listYardContainers = async (req, res) => {
  const filter = { customerCustId: req.user.customerCustId };
  if (req.query.status) filter.status = String(req.query.status);
  if (req.query.typeId) filter.typeId = toUpper(req.query.typeId);
  if (req.query.unplaced === 'true') filter.currentSlotId = null;
  const docs = await YardContainer.find(filter)
    .sort({ containerNo: 1 })
    .limit(500);
  return res.status(200).json({ items: docs.map(YardContainer.toClient) });
};

export const createYardContainer = async (req, res) => {
  const body = req.body || {};
  const containerNo = toUpper(body.containerNo);
  const typeId = toUpper(body.typeId);
  const status = toStr(body.status) || 'IN_YARD';
  const ownerName = toStr(body.ownerName);
  const grossWeightKg = body.grossWeightKg != null ? toNonNegNumber(body.grossWeightKg) : 0;
  const sealNo = toStr(body.sealNo);
  const eta = toDate(body.eta);
  const notes = toStr(body.notes);

  const errors = {};
  if (!containerNo) errors.containerNo = 'Required';
  if (!typeId) errors.typeId = 'Required';
  else if (!['20GP', '40GP', '40HC', '45HC'].includes(typeId))
    errors.typeId = 'Must be one of 20GP, 40GP, 40HC, 45HC';
  if (!YARD_CONTAINER_STATUS_VALUES.includes(status))
    errors.status = 'Invalid status';
  if (grossWeightKg == null) errors.grossWeightKg = 'Must be >= 0';
  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const existing = await YardContainer.findOne({
    customerCustId: req.user.customerCustId,
    containerNo,
  });
  if (existing) {
    return res.status(409).json({ message: 'Container number already exists' });
  }

  const created = await YardContainer.create({
    customerCustId: req.user.customerCustId,
    containerNo,
    typeId,
    status,
    ownerName,
    grossWeightKg: grossWeightKg ?? 0,
    sealNo,
    eta,
    placedAt: null,
    currentSlotId: null,
    notes,
  });

  emitUpdate(req.user.customerCustId, {
    kind: 'container.added',
    containerId: String(created._id),
    customerCustId: req.user.customerCustId,
  });

  return res.status(201).json({ item: YardContainer.toClient(created) });
};

export const updateYardContainer = async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return res.status(400).json({ message: 'Invalid container id' });
  }
  const container = await YardContainer.findOne({
    _id: id,
    customerCustId: req.user.customerCustId,
  });
  if (!container) return res.status(404).json({ message: 'Container not found' });

  const body = req.body || {};
  if (body.status != null) {
    if (!YARD_CONTAINER_STATUS_VALUES.includes(String(body.status))) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    container.status = body.status;
  }
  if (body.ownerName != null) container.ownerName = toStr(body.ownerName);
  if (body.grossWeightKg != null) {
    const n = toNonNegNumber(body.grossWeightKg);
    if (n == null) return res.status(400).json({ message: 'grossWeightKg invalid' });
    container.grossWeightKg = n;
  }
  if (body.sealNo != null) container.sealNo = toStr(body.sealNo);
  if (body.eta !== undefined) container.eta = toDate(body.eta);
  if (body.notes != null) container.notes = toStr(body.notes);

  await container.save();

  emitUpdate(req.user.customerCustId, {
    kind: 'container.updated',
    containerId: String(container._id),
    customerCustId: req.user.customerCustId,
  });

  return res.status(200).json({ item: YardContainer.toClient(container) });
};

export const moveYardContainer = async (req, res) => {
  const { id } = req.params;
  const targetSlotId = req.body?.targetSlotId;
  if (!isObjectId(id)) {
    return res.status(400).json({ message: 'Invalid container id' });
  }
  if (!isObjectId(targetSlotId)) {
    return res.status(400).json({ message: 'Invalid targetSlotId' });
  }

  const container = await YardContainer.findOne({
    _id: id,
    customerCustId: req.user.customerCustId,
  });
  if (!container) return res.status(404).json({ message: 'Container not found' });

  const targetSlot = await Slot.findOne({
    _id: targetSlotId,
    customerCustId: req.user.customerCustId,
  });
  if (!targetSlot) return res.status(404).json({ message: 'Target slot not found' });

  const yard = await Yard.findOne({
    _id: targetSlot.yardId,
    customerCustId: req.user.customerCustId,
    isDeleted: { $ne: true },
  });
  if (!yard) return res.status(404).json({ message: 'Yard not found for slot' });

  const targetCellSlots = await Slot.find({
    yardId: yard._id,
    blockCode: targetSlot.blockCode,
    row: targetSlot.row,
    col: targetSlot.col,
    customerCustId: req.user.customerCustId,
  }).sort({ tier: 1 });

  const lowestEmpty = targetCellSlots.find((s) => !s.yardContainerId);
  const sameContainer =
    container.currentSlotId &&
    targetCellSlots.some(
      (s) => String(s._id) === String(container.currentSlotId)
    );

  if (sameContainer) {
    return res.status(200).json({ item: YardContainer.toClient(container) });
  }

  if (!lowestEmpty) {
    return res.status(409).json({
      message: 'Target slot is full (no empty tier at that cell)',
    });
  }
  if (lowestEmpty.tier > 1 && targetCellSlots.every((s) => s.tier > 1)) {
    return res.status(409).json({
      message: 'Cannot stack without a container on tier 1',
    });
  }

  if (container.currentSlotId) {
    await Slot.updateOne(
      { _id: container.currentSlotId },
      { $set: { yardContainerId: null } }
    );
  }

  lowestEmpty.yardContainerId = container._id;
  await lowestEmpty.save();

  container.currentSlotId = lowestEmpty._id;
  container.status = 'GROUNDED';
  container.placedAt = new Date();
  await container.save();

  emitUpdate(req.user.customerCustId, {
    kind: 'container.moved',
    yardId: String(yard._id),
    containerId: String(container._id),
    slotId: String(lowestEmpty._id),
    customerCustId: req.user.customerCustId,
  });

  return res.status(200).json({ item: YardContainer.toClient(container) });
};

export const releaseYardContainer = async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return res.status(400).json({ message: 'Invalid container id' });
  }
  const container = await YardContainer.findOne({
    _id: id,
    customerCustId: req.user.customerCustId,
  });
  if (!container) return res.status(404).json({ message: 'Container not found' });

  let yardId = null;
  if (container.currentSlotId) {
    const slot = await Slot.findById(container.currentSlotId);
    if (slot) {
      yardId = String(slot.yardId);
      slot.yardContainerId = null;
      await slot.save();
    }
  }

  container.currentSlotId = null;
  container.status = 'OUT_GATED';
  await container.save();

  emitUpdate(req.user.customerCustId, {
    kind: 'container.released',
    yardId,
    containerId: String(container._id),
    customerCustId: req.user.customerCustId,
  });

  return res.status(200).json({ item: YardContainer.toClient(container) });
};
