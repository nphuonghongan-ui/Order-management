import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

export const initSocket = (httpServer, origins) => {
  io = new Server(httpServer, {
    cors: {
      origin: origins,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake?.auth?.token;
    if (!token) {
      return next(new Error('Unauthorized: missing token'));
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.typ && payload.typ !== 'access') {
        return next(new Error('Unauthorized: invalid token type'));
      }
      socket.data.user = {
        userName: payload.userName,
        role: payload.role,
        customerCustId: payload.customerCustId,
      };
      return next();
    } catch {
      return next(new Error('Unauthorized: invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const room = `customer:${socket.data.user.customerCustId}`;
    socket.join(room);
    socket.emit('connected', { room });
  });

  return io;
};

export const getIO = () => io;

export const roomFor = (customerCustId) => `customer:${customerCustId}`;
