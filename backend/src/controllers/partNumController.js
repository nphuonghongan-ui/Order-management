import PartNum from '../models/PartNum.js';

const MAX_IMPORT_ROWS = 1000;
const DEFAULT_PAGE_LIMIT = 100;
const MAX_PAGE_LIMIT = 100;

const toPositiveInt = (v, min = 1) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return Number.isInteger(n) && n >= min ? n : null;
};

const toNonNegNumber = (v) => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const toUpperTrimmed = (v) =>
  typeof v === 'string' && v.trim() ? v.trim().toUpperCase() : null;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const encodeCursor = (no, partNum) =>
  Buffer.from(JSON.stringify({ n: no, p: partNum })).toString('base64url');

const decodeCursor = (raw) => {
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    if (typeof parsed?.n !== 'number' || typeof parsed?.p !== 'string' || !parsed.p) {
      return null;
    }
    return { no: parsed.n, partNum: parsed.p };
  } catch {
    return null;
  }
};

const validatePartNumInput = (raw) => {
  const errors = {};
  const partNum = toUpperTrimmed(raw?.partNum);
  if (!partNum) errors.partNum = 'Required';
  const dim = raw?.dimension;
  if (!dim || typeof dim !== 'object') {
    errors.dimension = 'Required';
  } else {
    const length = toNonNegNumber(dim.length);
    const width = toNonNegNumber(dim.width);
    const height = toNonNegNumber(dim.height);
    if (length == null) errors['dimension.length'] = 'Required';
    if (width == null) errors['dimension.width'] = 'Required';
    if (height == null) errors['dimension.height'] = 'Required';
  }
  if (raw?.weightKg !== undefined && raw?.weightKg !== null && raw?.weightKg !== '') {
    if (toNonNegNumber(raw.weightKg) == null) errors.weightKg = 'Invalid';
  }
  if (raw?.no !== undefined && raw?.no !== null && raw?.no !== '') {
    if (toPositiveInt(raw.no) == null) errors.no = 'Min 1';
  }
  return { errors, partNum, dim };
};

const sanitizePayload = (raw) => {
  const out = {
    partNum: toUpperTrimmed(raw?.partNum),
    dimension: {
      length: toNonNegNumber(raw?.dimension?.length),
      width: toNonNegNumber(raw?.dimension?.width),
      height: toNonNegNumber(raw?.dimension?.height),
    },
    weightKg: raw?.weightKg === undefined || raw?.weightKg === null || raw?.weightKg === ''
      ? 0
      : toNonNegNumber(raw.weightKg) ?? 0,
  };
  if (raw?.no !== undefined && raw?.no !== null && raw?.no !== '') {
    out.no = toPositiveInt(raw.no);
  }
  return out;
};

export const listPartNums = async (req, res) => {
  const filter = {};

  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    filter.partNum = {
      $regex: escapeRegex(req.query.q.trim()),
      $options: 'i',
    };
  }

  const rawLimit = parseInt(req.query.limit, 10);
  const hasLimit = Number.isFinite(rawLimit) && rawLimit > 0;
  const limit = hasLimit ? Math.min(rawLimit, MAX_PAGE_LIMIT) : DEFAULT_PAGE_LIMIT;

  if (req.query.cursor) {
    const decoded = decodeCursor(req.query.cursor);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid cursor' });
    }
    filter.$or = [
      { no: { $gt: decoded.no } },
      { no: decoded.no, partNum: { $gt: decoded.partNum } },
    ];
  }

  const docs = await PartNum.find(filter)
    .sort({ no: 1, partNum: 1 })
    .limit(limit + 1);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last ? encodeCursor(last.no, last.partNum) : null;

  return res.status(200).json({
    items: page.map(PartNum.toClient),
    nextCursor,
    hasMore,
  });
};

export const getNextPartNumNo = async (req, res) => {
  const last = await PartNum.findOne().sort({ no: -1 }).select('no').lean();
  const no = (last?.no ?? 0) + 1;
  return res.status(200).json({ no });
};

export const createPartNum = async (req, res) => {
  const { errors, partNum, dim } = validatePartNumInput(req.body || {});
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  const payload = sanitizePayload(req.body);

  const dup = await PartNum.findOne({ partNum }).select('_id').lean();
  if (dup) {
    return res.status(409).json({
      message: `Part number "${partNum}" already exists`,
      errors: { partNum: 'Already exists' },
    });
  }

  if (payload.no == null) {
    const last = await PartNum.findOne().sort({ no: -1 }).select('no').lean();
    payload.no = (last?.no ?? 0) + 1;
  } else {
    const conflict = await PartNum.findOne({ no: payload.no }).select('_id partNum').lean();
    if (conflict) {
      return res.status(409).json({
        message: `No. ${payload.no} is already used by "${conflict.partNum}"`,
        errors: { no: 'Already used' },
      });
    }
  }

  try {
    const doc = await PartNum.create(payload);
    return res.status(201).json({ item: PartNum.toClient(doc) });
  } catch (err) {
    if (err?.code === 11000) {
      const key = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({
        message: `Duplicate ${key}`,
        errors: { [key]: 'Already exists' },
      });
    }
    return res.status(500).json({ message: 'Failed to create part number' });
  }
};

export const importPartNums = async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'items must be a non-empty array' });
  }
  if (items.length > MAX_IMPORT_ROWS) {
    return res.status(400).json({
      message: `Too many rows (max ${MAX_IMPORT_ROWS})`,
    });
  }

  const errors = [];
  const clean = [];
  const partNumsInBatch = new Map();

  items.forEach((raw, idx) => {
    const rowNumber = idx + 1;
    const { errors: rowErrors, partNum } = validatePartNumInput(raw);
    if (Object.keys(rowErrors).length > 0) {
      errors.push({
        row: rowNumber,
        partNum: raw?.partNum ?? null,
        message: Object.values(rowErrors).join('; '),
      });
      return;
    }
    if (partNumsInBatch.has(partNum)) {
      errors.push({
        row: rowNumber,
        partNum,
        message: 'Duplicate partNum in import file',
      });
      return;
    }
    partNumsInBatch.set(partNum, rowNumber);
    clean.push({ rowNumber, data: sanitizePayload(raw) });
  });

  if (clean.length === 0) {
    return res.status(400).json({
      message: 'No valid rows to import',
      createdCount: 0,
      skippedCount: items.length,
      errors,
    });
  }

  const incoming = clean.map((c) => c.data.partNum);
  const existingDocs = await PartNum.find({ partNum: { $in: incoming } })
    .select('partNum')
    .lean();
  const existingSet = new Set(existingDocs.map((d) => d.partNum));

  const existingRows = [];
  const toInsert = [];
  clean.forEach((c) => {
    if (existingSet.has(c.data.partNum)) {
      existingRows.push(c);
    } else {
      toInsert.push(c);
    }
  });

  existingRows.forEach((c) => {
    errors.push({
      row: c.rowNumber,
      partNum: c.data.partNum,
      message: 'Part number already exists',
    });
  });

  let created = [];
  if (toInsert.length > 0) {
    const maxNoDoc = await PartNum.findOne().sort({ no: -1 }).select('no').lean();
    let nextNo = (maxNoDoc?.no ?? 0) + 1;
    toInsert.forEach((c) => {
      c.data.no = nextNo;
      nextNo += 1;
    });

    try {
      const docs = await PartNum.insertMany(
        toInsert.map((c) => c.data),
        { ordered: false }
      );
      created = docs;
    } catch (err) {
      const writeErrors = Array.isArray(err?.writeErrors) ? err.writeErrors : [];
      const inserted = Array.isArray(err?.insertedDocs) ? err.insertedDocs : [];
      created = inserted;
      writeErrors.forEach((we) => {
        const idx = we.index ?? 0;
        const original = toInsert[idx];
        const dupKey = we.err?.keyPattern ? Object.keys(we.err.keyPattern)[0] : null;
        const message = we.err?.code === 11000 && dupKey
          ? dupKey === 'partNum'
            ? 'Part number already exists'
            : `Duplicate ${dupKey}`
          : we.errmsg || 'Insert failed';
        errors.push({
          row: original?.rowNumber ?? idx + 1,
          partNum: original?.data?.partNum ?? null,
          message,
        });
      });
    }
  }

  return res.status(200).json({
    createdCount: created.length,
    skippedCount: items.length - created.length,
    created: created.map(PartNum.toClient),
    errors,
  });
};

export const deletePartNum = async (req, res) => {
  const { id } = req.params;
  const deleted = await PartNum.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ message: 'Part number not found' });
  }
  return res.status(200).json({
    message: `Part number "${deleted.partNum}" deleted`,
    item: PartNum.toClient(deleted),
  });
};
