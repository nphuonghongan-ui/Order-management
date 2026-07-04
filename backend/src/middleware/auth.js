import jwt from 'jsonwebtoken';

const extractBearer = (req) => {
  const header = req.headers.authorization || '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : null;
};

export const requireAuth = (req, res, next) => {
  const token = extractBearer(req);
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.typ && payload.typ !== 'access') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    req.user = {
      userName: payload.userName,
      role: payload.role,
      customerCustId: payload.customerCustId,
    };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireRole = (...allowed) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  return next();
};
