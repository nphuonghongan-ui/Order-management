import Container from '../models/Container.js';

export const listContainers = async (_req, res) => {
  const docs = await Container.find().sort({ typeId: 1 });
  return res.status(200).json({
    items: docs.map(Container.toClient),
  });
};
