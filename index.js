import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import webpush from 'web-push';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;
const ADMIN = 'Admin';

const publicVapidKey = 'BMW-3ps2Bk_aSzQ9I7Funh9dHtQRC8Ld3oqN6ORW9FpsAOsmMkQBAk1wxyLtAli2TISNgu0t7PU3MkM_a6S4Mi0'; // <-- PASTE YOUR PUBLIC KEY HERE
const privateVapidKey = 'J2NAnPnv6rJxYReWZ9d9cvD0dRTYjYOHak8FuPYxXOo'; // <-- PASTE YOUR PRIVATE KEY HERE

webpush.setVapidDetails(
  'mailto:test@test.com',
  publicVapidKey,
  privateVapidKey
);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const expressServer = app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

// state
const UsersState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
};

let subscriptions = {};

// In index.js

// ... (keep the rest of the code the same)

const io = new Server(expressServer, {
  // ADD THIS LINE to allow larger files (e.g., 100MB)
  maxHttpBufferSize: 1e8,
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? false
        : ['http://localhost:5500', 'http://127.0.0.1:5500'],
  },
});

// ... (the rest of your code)
io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.emit('message', buildMsg(ADMIN, 'Welcome to Chat App!'));

  // ADDED: Store user's push notification subscription
  socket.on('subscribe', (subscription) => {
    subscriptions[socket.id] = subscription;
    console.log(`User ${socket.id} subscribed to notifications`);
  });

  socket.on('enterRoom', ({ name, room }) => {
    const prevRoom = getUser(socket.id)?.room;
    if (prevRoom) {
      socket.leave(prevRoom);
      io.to(prevRoom).emit(
        'message',
        buildMsg(ADMIN, `${name} has left the room`)
      );
    }
    const user = activateUser(socket.id, name, room);
    if (prevRoom) {
      io.to(prevRoom).emit('userList', {
        users: getUsersInRoom(prevRoom),
      });
    }
    socket.join(user.room);
    socket.emit(
      'message',
      buildMsg(ADMIN, `You have joined the ${user.room} chat room`)
    );
    socket.broadcast
      .to(user.room)
      .emit('message', buildMsg(ADMIN, `${user.name} has joined the room`));
    io.to(user.room).emit('userList', {
      users: getUsersInRoom(user.room),
    });
    io.emit('roomList', {
      rooms: getAllActiveRooms(),
    });
  });

  socket.on('disconnect', () => {
    const user = getUser(socket.id);
    userLeavesApp(socket.id);
    delete subscriptions[socket.id];
    if (user) {
      io.to(user.room).emit(
        'message',
        buildMsg(ADMIN, `${user.name} has left the room`)
      );
      io.to(user.room).emit('userList', {
        users: getUsersInRoom(user.room),
      });
      io.emit('roomList', {
        rooms: getAllActiveRooms(),
      });
    }
    console.log(`User ${socket.id} disconnected`);
  });

  socket.on('message', ({ name, text }) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      io.to(room).emit('message', buildMsg(name, text));

       // ADDED: Push Notification Logic
      const usersInRoom = getUsersInRoom(room);
      usersInRoom.forEach((user) => {
        // Don't send a notification to the person who sent the message
        if (user.id === socket.id) return;

        const subscription = subscriptions[user.id];
        if (subscription) {
          let payload = {
            title: `New message in ${room}`,
            body: `${name}: ${text}`,
          };
        // Check for mentions
          if (text.includes(`@${user.name}`)) {
            payload = {
              title: `You were mentioned in ${room}!`,
              body: `${name} mentioned you: ${text}`,
            };
          }
           webpush
            .sendNotification(subscription, JSON.stringify(payload))
            .catch((err) => console.error('Error sending notification', err));
    }
  });
}
});

  // ADDED: Listen for a file event
  socket.on('file', (fileData) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      // Broadcast the file to the room
      io.to(room).emit('file', buildFileMsg(fileData));
    }
  });

  socket.on('activity', (name) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      socket.broadcast.to(room).emit('activity', name);
    }
  });
});

function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(new Date()),
  };
}

// ADDED: Function to build file message payload
function buildFileMsg(fileData) {
  return {
    ...fileData,
    time: new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(new Date()),
  };
}

// User functions
function activateUser(id, name, room) {
  const user = { id, name, room };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function userLeavesApp(id) {
  UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
}

function getUser(id) {
  return UsersState.users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  return UsersState.users.filter((user) => user.room === room);
}

function getAllActiveRooms() {
  return Array.from(new Set(UsersState.users.map((user) => user.room)));
}