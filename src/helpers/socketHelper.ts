import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};

export const socketHelper = { socket };

export const initializeSocketConnection = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected with chat'));

    //send msg
    socket.on('message', (data: any) => {
      console.log(data);
      io.emit('receive', data);
    });

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect with chat'));
    });
  });
};
