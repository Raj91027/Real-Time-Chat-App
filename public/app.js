const socket = io('ws://localhost:3500');
const publicVapidKey = 'BMW-3ps2Bk_aSzQ9I7Funh9dHtQRC8Ld3oqN6ORW9FpsAOsmMkQBAk1wxyLtAli2TISNgu0t7PU3MkM_a6S4Mi0';

const msgInput = document.querySelector('#message');
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
const activity = document.querySelector('.activity');
const usersList = document.querySelector('.user-list');
const roomList = document.querySelector('.room-list');
const chatDisplay = document.querySelector('.chat-display');
const appDisplay = document.querySelector('.app');
const fileInput = document.querySelector('#fileInput');
// ADD this line to get the main container
const container = document.querySelector('.container');

function sendMessage(e) {
  e.preventDefault();
  if (nameInput.value && msgInput.value && chatRoom.value) {
    socket.emit('message', {
      name: nameInput.value,
      text: msgInput.value,
    });
    msgInput.value = '';
  }
  msgInput.focus();
}

function enterRoom(e) {
  e.preventDefault();
  if (nameInput.value && chatRoom.value) {
    socket.emit('enterRoom', {
      name: nameInput.value,
      room: chatRoom.value,
    });

    initPushNotifications();
    // ADD THIS LOGIC to change the theme
    const room = chatRoom.value;
    // First, remove any existing theme classes
    container.classList.remove('red-room', 'green-room', 'blue-room');
    // Then, add the new class based on the selected room
    if (room === 'Red') container.classList.add('red-room');
    else if (room === 'Green') container.classList.add('green-room');
    else if (room === 'Blue') container.classList.add('blue-room');
  }
}
// ADD THE ENTIRE NEW FUNCTION BELOW
async function initPushNotifications() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const register = await navigator.serviceWorker.register('./sw.js', {
        scope: '/',
      });

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied.');
        return;
      }

      let subscription = await register.pushManager.getSubscription();
      if (subscription === null) {
        subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicVapidKey,
        });
      }

      // Send the subscription to the server
      socket.emit('subscribe', subscription);
    } catch (error) {
      console.error('Service Worker or Push Notification error:', error);
    }
  }
}

document.querySelector('.form-msg').addEventListener('submit', sendMessage);
document.querySelector('.form-join').addEventListener('submit', enterRoom);
msgInput.addEventListener('keypress', () => {
  socket.emit('activity', nameInput.value);
});

// ... (rest of the file is unchanged)

// ADDED: Listener for file input
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = function () {
    const fileData = {
      name: nameInput.value,
      filename: file.name,
      type: file.type,
      data: reader.result,
    };
    socket.emit('file', fileData);
  };
});

// Listen for messages
socket.on('message', (data) => {
  activity.textContent = '';
  const { name, text, time } = data;
  const li = document.createElement('li');
  li.className = 'post';
  if (name === nameInput.value) li.className = 'post post--left';
  if (name !== nameInput.value && name !== 'Admin')
    li.className = 'post post--right';
  if (name !== 'Admin') {
    li.innerHTML = `<div class="post__header ${
      name === nameInput.value ? 'post__header--user' : 'post__header--reply'
    }">
        <span class="post__header--name">${name}</span> 
        <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`;
  } else {
    li.innerHTML = `<div class="post__text">${text}</div>`;
  }
  chatDisplay.appendChild(li);
  appDisplay.scrollTop = appDisplay.scrollHeight;
});

// ADDED: Listen for files
socket.on('file', (data) => {
  activity.textContent = '';
  const { name, filename, type, data: fileData, time } = data;
  const li = document.createElement('li');
  li.className = 'post';
  if (name === nameInput.value) li.className = 'post post--left';
  if (name !== nameInput.value && name !== 'Admin')
    li.className = 'post post--right';

  let fileContent;
  if (type.startsWith('image/')) {
    fileContent = `<img src="${fileData}" alt="${filename}" style="max-width: 100%; border-radius: 10px;">`;
  } else {
    fileContent = `<a href="${fileData}" download="${filename}">${filename}</a>`;
  }

  li.innerHTML = `<div class="post__header ${
    name === nameInput.value ? 'post__header--user' : 'post__header--reply'
  }">
      <span class="post__header--name">${name}</span> 
      <span class="post__header--time">${time}</span> 
      </div>
      <div class="post__text">${fileContent}</div>`;

  chatDisplay.appendChild(li);
  appDisplay.scrollTop = appDisplay.scrollHeight;
});

let activityTimer;
socket.on('activity', (name) => {
  activity.textContent = `${name} is typing...`;
  clearTimeout(activityTimer);
  activityTimer = setTimeout(() => {
    activity.textContent = '';
  }, 3000);
});

socket.on('userList', ({ users }) => showUsers(users));
socket.on('roomList', ({ rooms }) => showRooms(rooms));

function showUsers(users) {
  usersList.textContent = '';
  if (users) {
    usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
    users.forEach((user, i) => {
      usersList.textContent += ` ${user.name}`;
      if (users.length > 1 && i !== users.length - 1) {
        usersList.textContent += ',';
      }
    });
  }
}

function showRooms(rooms) {
  roomList.textContent = '';
  if (rooms) {
    roomList.innerHTML = '<em>Active Rooms:</em>';
    rooms.forEach((room, i) => {
      roomList.textContent += ` ${room}`;
      if (rooms.length > 1 && i !== rooms.length - 1) {
        roomList.textContent += ',';
      }
    });
  }
}