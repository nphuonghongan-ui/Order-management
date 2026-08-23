import mongoose from 'mongoose';
import Yard from '../models/Yard.js';
import Slot from '../models/Slot.js';
import YardContainer from '../models/YardContainer.js';
import { getIO, roomFor } from '../lib/socket.js';

const isObjectId = (s) => s != null && mongoose.Types.ObjectId.isValid(String(s));

export const getYardLayout = async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return res.status(400).json({ message: 'Invalid yard id' });
  }
  const yard = await Yard.findOne({
    _id: id,
    customerCustId: req.user.customerCustId,
    isDeleted: { $ne: true },
  });
  if (!yard) return res.status(404).json({ message: 'Yard not found' });

  const slots = await Slot.find({
    yardId: yard._id,
    customerCustId: req.user.customerCustId,
  }).sort({ blockCode: 1, row: 1, col: 1, tier: 1 });

  const containerIds = slots
    .map((s) => s.yardContainerId)
    .filter((v) => v != null);
  const containers = containerIds.length
    ? await YardContainer.find({
        _id: { $in: containerIds },
        customerCustId: req.user.customerCustId,
      })
    : [];
  const containerMap = new Map(containers.map((c) => [String(c._id), c]));

  const slotItems = slots.map((s) => {
    const base = Slot.toClient(s);
    const container = s.yardContainerId
      ? containerMap.get(String(s.yardContainerId))
      : null;
    return {
      ...base,
      container: container ? YardContainer.toClient(container) : null,
    };
  });

  let occupied = 0;
  let stacked = 0;
  for (const s of slots) {
    if (s.yardContainerId) occupied += 1;
    if (s.tier > 1 && s.yardContainerId) stacked += 1;
  }
  const totalSlots = slots.length;

  return res.status(200).json({
    yard: Yard.toClient(yard),
    slots: slotItems,
    stats: {
      totalSlots,
      occupied,
      empty: totalSlots - occupied,
      stacked,
      occupancyPct: totalSlots ? Math.round((occupied / totalSlots) * 1000) / 10 : 0,
    },
  });
};

export const reserveSlot = async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return res.status(400).json({ message: 'Invalid slot id' });
  }
  const slot = await Slot.findOne({
    _id: id,
    customerCustId: req.user.customerCustId,
  });
  if (!slot) return res.status(404).json({ message: 'Slot not found' });
  slot.isReserved = Boolean(req.body?.reserved);
  await slot.save();

  const io = getIO();
  if (io) {
    io.to(roomFor(req.user.customerCustId)).emit('yard:update', {
      kind: 'slot.reserved',
      yardId: String(slot.yardId),
      slotId: String(slot._id),
      reserved: slot.isReserved,
    });
  }
  return res.status(200).json({ item: Slot.toClient(slot) });
};
