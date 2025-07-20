// src/api.js
import axios from "axios";

const API_URL = "http://localhost:5000";

export const login = (data) => axios.post(`${API_URL}/login`, data);
export const register = (data) => axios.post(`${API_URL}/register`, data);
export const fetchProducts = () => axios.get(`${API_URL}/products`);
