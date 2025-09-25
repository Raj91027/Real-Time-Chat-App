Real-Time Chat Application
A feature-rich, real-time chat application built with Node.js, Express, and Socket.IO. This project allows users to communicate seamlessly in themed chat rooms, share files, set up profiles, and send private messages, all with the support of push notifications to keep them engaged.

✨ Features
This application is packed with modern features to provide a complete chatting experience:

Real-Time Messaging: Instant message delivery using WebSockets.

Themed Chat Rooms: Join one of three visually distinct rooms (Red, Green, Blue), each with its own color theme.

File Sharing: Share images, documents, and videos directly in the chat. Images are previewed, and other files are available for download.

Push Notifications: Receive browser notifications for new messages and when you are mentioned (@username), even when the chat tab is not active.

"Is Typing..." Indicator: See when another user is actively typing a message.

Active User & Room Lists: View a list of all users currently in your room and a list of all active rooms on the server.

Responsive Design: A clean and modern UI that works beautifully on both desktop and mobile devices.

🛠️ Technologies Used
The application is built with a modern, efficient, and scalable tech stack:

Backend: Node.js, Express.js

Real-time Communication: Socket.IO

Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)

Push Notifications: Web Push API, web-push npm package

🚀 Getting Started
Follow these instructions to get a local copy of the project up and running for development and testing.

Prerequisites
Node.js (v14 or higher)

npm (Node Package Manager)

Installation & Setup
Clone the repository:

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

Install backend dependencies:

npm install

Generate VAPID Keys for Push Notifications:
The application uses the web-push library to send notifications. You need to generate a unique set of VAPID keys.

npx web-push generate-vapid-keys

This command will output a public and a private key. You will need these for the next step.

Configure Your Keys:
You need to place your generated VAPID keys into both the server and client-side code:

In index.js (Server):

const publicVapidKey = 'PASTE_YOUR_PUBLIC_KEY_HERE';
const privateVapidKey = 'PASTE_YOUR_PRIVATE_KEY_HERE';

In public/app.js (Client):

const publicVapidKey = 'PASTE_YOUR_PUBLIC_KEY_HERE';

Run the Server:

npm start 

Or, if you do not have a start script in package.json:

node index.js

Open the Application:
Open your web browser and navigate to http://localhost:3500.

📁 Project Structure
.
├── public/
│   ├── app.js         # Client-side logic
│   ├── index.html     # Main HTML structure
│   ├── style.css      # All styles for the application
│   └── sw.js          # Service worker for push notifications
│
├── node_modules/
├── index.js           # Server-side logic (Express & Socket.IO)
├── package.json
└── README.md

🔮 Future Enhancements
Message History: Store and retrieve chat history from a database like MongoDB or Firestore.

User Profiles:

Set a custom avatar, bio, and status.

View other users' profiles by clicking on their name.

Private Messaging: Send one-on-one private messages to other users directly from their profile view.

Emoji Support: Add an emoji picker for messages.

User Authentication: Implement a proper login/signup system.

Image Compression: Compress images on the client-side before uploading to save bandwidth.

Feel free to contribute to this project by submitting a pull request. For major changes, please open an issue first to discuss what you would like to change.
