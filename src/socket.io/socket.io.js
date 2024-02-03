import io from 'socket.io-client';
import {BASE_URL, PORT} from '../utils/Strings';

const socket = io(BASE_URL + PORT);
socket.on('connect', () => {
  console.log('Connected to server');
  // Gửi và nhận các thông điệp từ máy chủ
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
});
export default socket;
