// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./dashboard";
import ProductsPage from "./ProductsPage";
import CartPage from "./CartPage";
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/cart" element={<CartPage />} />
    </Routes>
  );
}

export default App;
