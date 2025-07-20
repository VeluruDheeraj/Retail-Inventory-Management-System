// src/Login.js
import React, { useState } from "react";
import { login, register } from "./api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    try {
      const { data } = await login(form);
      setMsg(data.message);
      navigate("/dashboard"); // ✅ redirect to dashboard
    } catch (e) {
      setMsg(e?.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async () => {
    try {
      const { data } = await register(form);
      setMsg(data.message);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2>User Login</h2>
        <input
          className="login-input"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <input
          className="login-input"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <div className="button-group">
          <button className="login-button login" onClick={handleLogin}>
            Login
          </button>
          <button className="login-button register" onClick={handleRegister}>
            Register
          </button>
        </div>
        <p className="login-message">{msg}</p>
      </div>
    </div>
  );
}
