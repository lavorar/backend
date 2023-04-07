'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {

    const io = require('socket.io')(strapi.server.httpServer, {

      cors: {
        origin: "http://localhost:3000",
        methods: ['GET', 'POST'],
        allowedHeaders: [{ 'access-control-allow-origin': "http://localhost:3000" }, { 'access-control-allow-credentials': true }],
        credentials: true
      }
    })

    const conectedUsers = new Map();
    const addUser = (userId, socketId) => {
      if (!conectedUsers.has(userId)) {
        conectedUsers.set(userId, socketId);
      } else {
        const existingSocketId = conectedUsers.get(userId);
        if (existingSocketId !== socketId) {
          conectedUsers.set(userId, socketId);
        }
      }
    };

    const removeUser = (socketId) => {
      for (let [key, value] of conectedUsers) {
        console.log('desconectado', key + " = " + value);
        if (value === socketId) {
          conectedUsers.delete(key);
        }
      }
    };

    const getUser = (userId) => {
      return conectedUsers.get(userId);
    };
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      // ...
      if (token) {
        next();
      }
      else {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      const { token, userId } = socket.handshake.auth;
      console.log('a user connected socket ', userId);
      if (userId) {
        addUser(userId, socket.id);
        io.emit("getUsers", Object.fromEntries([...conectedUsers]));
      }
      //when ceonnect      
      //take userId and socketId from user
      socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        // console.log('addUser', userId, socket.id)
        io.emit("getUsers", Object.fromEntries([...conectedUsers]));
      });
      console.log('conectedUsers', conectedUsers)
      //send and get message
      socket.on("sendMessage", (mensaje) => {
        const socketId = getUser(mensaje?.receiver?.id);
        if (socketId) {
          console.log('sendMessage', mensaje)
          console.log('user', socketId)
          io.to(socketId).emit("getMessage", mensaje);
        }
        else {
          console.log('user not found', receiver.id)
        }
      });
      socket.on("sendNotification", ({ notification, receiverId, senderId }) => {
        const socketId = getUser(receiverId);
        if (socketId) {
          console.log('sendNotification', notification)
          console.log('users', conectedUsers, receiverId, senderId)

          const { attributes, ...rest } = notification;
          const noti = { ...attributes, ...rest };
          console.log('user', socketId)
          io.to(socketId).emit("getNotification", noti);
        }
        else {
          console.log('user not found', receiverId)
        }
      });

      socket.on("deleteNotification", ({ notification, receiverId, senderId }) => {
        const socketId = getUser(receiverId);
        if (socketId) {
          console.log('deleteNotification', notification)
          console.log('users', conectedUsers, receiverId, senderId)
          const { attributes, ...rest } = notification;
          const noti = { ...attributes, ...rest };
          console.log('user', socketId)
          io.to(socketId).emit("clearNotification", noti);
        }
        else {
          console.log('user not found', receiverId)
        }
      });

      //when disconnect
      socket.on("disconnect", () => {
        console.log("a user disconnected!", socket.id);
        removeUser(socket.id);
        io.emit("getUsers", Object.fromEntries([...conectedUsers]));
      });
    });
  },

};
