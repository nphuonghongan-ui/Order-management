import PartNum from '../models/PartNum.js';

export const listPartNums = async (req, res) => {
  const docs = await PartNum.find().sort({ no: 1, partNum: 1 });
  return res.status(200).json({
    items: docs.map(PartNum.toClient),
  });
};
