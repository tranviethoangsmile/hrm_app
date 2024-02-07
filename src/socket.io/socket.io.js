import io from 'socket.io-client';
import {BASE_URL, BASE_URL_DEV, PORT, PORT_DEV} from '../utils/Strings';

const socket = io(BASE_URL_DEV + PORT_DEV);
socket.on('connect', () => {
  console.log('Connected to server');
  // Gửi và nhận các thông điệp từ máy chủ
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
});
export default socket;
