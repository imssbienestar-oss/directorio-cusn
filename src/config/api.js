// src/config/api.js
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${baseUrl}/api`;

export default API_URL;
export { API_URL };  

