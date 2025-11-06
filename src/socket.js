import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000'; // Your Socket.IO server URL

const socket = io(SOCKET_URL, {
    autoConnect: false, // Don't connect automatically
});

export default socket;