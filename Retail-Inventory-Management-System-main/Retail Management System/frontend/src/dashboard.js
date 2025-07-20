// src/dashboard.js
import React from "react";
import "./dashboard.css";
import { FaSearch, FaShoppingCart, FaSignInAlt, FaUsers } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import { MdSupportAgent } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToProducts = () => {
    navigate("/products");
  };

  const history = JSON.parse(localStorage.getItem("purchaseHistory") || "[]").reverse();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo-icon-box">
            <FaShoppingCart className="logo-icon" />
          </div>
          <span className="logo-text">E-Commerce Store</span>
        </div>

        <div className="search-bar">
          <input type="text" placeholder="Search products..." />
          <button>
            <FaSearch />
          </button>
        </div>

        <nav className="dashboard-nav">
          <div className="nav-button" data-tooltip="Go to Home">
            <button onClick={scrollToTop}><AiFillHome /> Home</button>
          </div>
          <div className="nav-button" data-tooltip="Browse Products">
            <button onClick={goToProducts}><BsBoxSeam /> Products</button>
          </div>
          <div className="nav-button" data-tooltip="View Your Cart">
            <button onClick={() => navigate("/cart")}><FaShoppingCart /> Cart</button>
          </div>
          <div className="nav-button" data-tooltip="Logout of Your Account">
            <button><FaSignInAlt /> Logout</button>
          </div>
        </nav>
      </header>

      <main className="dashboard-body">
        <section className="hero-section">
          <h1>Welcome to Our Store</h1>
          <p>
            Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast shipping.
          </p>
          <button className="start-shopping-btn" onClick={goToProducts}>
            <FaShoppingCart className="btn-icon" /> Start Shopping
          </button>
        </section>

        <section className="stats-section">
          <div className="stat-box">
            <FaUsers className="stat-icon" />
            <h2>1000+</h2>
            <p>Products Available</p>
          </div>
          <div className="stat-box">
            <FaUsers className="stat-icon" />
            <h2>50K+</h2>
            <p>Happy Customers</p>
          </div>
          <div className="stat-box">
            <MdSupportAgent className="stat-icon" />
            <h2>24/7</h2>
            <p>Customer Support</p>
          </div>
        </section>

        <section className="history-section">
          <h2>Purchase History</h2>
          {history.length === 0 ? (
            <p>No previous purchases yet.</p>
          ) : (
            history.map((order) => (
              <div key={order.id} className="order-card">
                <h3>🧾 Order on {order.date}</h3>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.product_name} ({item.brand_name}) × {item.quantity} = ₹
                      {(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <strong>Total: ₹{order.total.toFixed(2)}</strong>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
