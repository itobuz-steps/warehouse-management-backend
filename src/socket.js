import { Server } from 'socket.io';

let ioInstance;

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      socket.join(userId); // join room = userId
      console.log('User connected:', userId);
    }

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  return ioInstance;
};

export const io = () => ioInstance;
