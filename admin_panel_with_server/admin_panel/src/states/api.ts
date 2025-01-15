import { io } from "socket.io-client";
/**
 * BaseAPi
 * 
 * @since 1.1.0
 */
const baseAPI = "http://localhost:3000";

export const socket = io(baseAPI, {
    withCredentials: true
});
socket.on('connect', () => {
    console.log('Connected with socket ID:', socket.id);
});

export const socketID = socket.id;

export default baseAPI;