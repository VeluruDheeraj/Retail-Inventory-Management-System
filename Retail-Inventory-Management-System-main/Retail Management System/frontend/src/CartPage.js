import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import "./dashboard.css";
import "./products.css";

export default function CartPage() {
  const [cart, setCart] = useState({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const saveCart = (updated) => {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const addOne = (key) => {
    const item = cart[key];
    if (!item) return;
    if (item.quantity >= item.brand_stock) {
      setErrorMsg(`❌ "${item.product_name} (${item.brand_name})" is out of stock`);
      return;
    }
    const updated = {
      ...cart,
      [key]: { ...item, quantity: item.quantity + 1 },
    };
    saveCart(updated);
    setErrorMsg("");
  };

  const removeOne = (key) => {
    const item = cart[key];
    if (!item) return;
    const updated = { ...cart };
    if (item.quantity === 1) {
      delete updated[key];
    } else {
      updated[key] = { ...item, quantity: item.quantity - 1 };
    }
    saveCart(updated);
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCart({});
  };

  const cartItems = Object.entries(cart);
  const subtotal = cartItems.reduce(
    (sum, [, item]) => sum + item.quantity * item.price,
    0
  );
  const shipping = 0;
  const tax = 32;
  const total = subtotal + shipping + tax;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setErrorMsg("❌ Cart is empty");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    

    const itemsToPurchase = cartItems.map(([, item]) => ({
      product_name: item.product_name,
      brand_name: item.brand_name,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch("http://localhost:5000/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: itemsToPurchase }),
      });

      const data = await response.json();

      if (response.ok) {
        const order = {
          id: Date.now(),
          date: new Date().toLocaleString(),
          items: cartItems.map(([, item]) => ({
            product_name: item.product_name,
            brand_name: item.brand_name,
            quantity: item.quantity,
            price: item.price,
          })),
          total,
        };

        const history = JSON.parse(localStorage.getItem("purchaseHistory") || "[]");
        history.push(order);
        localStorage.setItem("purchaseHistory", JSON.stringify(history));

        clearCart();
        setSuccessMsg("✅ Purchase successful! Stock updated.");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        // 🔥 FIX APPLIED HERE:
        setErrorMsg(data.error || "❌ Purchase failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setErrorMsg("❌ Server error during purchase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo-icon-box">
            <FaShoppingCart className="logo-icon" />
          </div>
          <span className="logo-text">My App</span>
        </div>

        <nav className="dashboard-nav">
          <div className="nav-button"data-tooltip="Go to products">
            <button onClick={() => navigate("/products")}>🔙 Back to Products</button>
          </div>
        </nav>
      </header>

      <div className="main-scroll-container">
        <main className="products-main">
          <h1>Cart Items</h1>

          {errorMsg && <p className="error-msg">{errorMsg}</p>}
          {successMsg && <p className="success-msg">{successMsg}</p>}

          {cartItems.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            <div className="cart-layout">
              <div className="product-grid cart-items-grid">
                {cartItems.map(([key, item]) => (
                  <div className="product-card" key={key}>
                    <div className="product-img">🖼️</div>
                    <h2>{item.product_name}</h2>
                    <p className="brand">Brand: {item.brand_name}</p>
                    <p className="price">
                      ₹{parseFloat(item.price).toFixed(2)} × {item.quantity}
                    </p>
                    <p className="stock">Stock: {item.brand_stock}</p>
                    <p className="total">
                      Total: ₹{(item.price * item.quantity).toFixed(2)}
                    </p>

                    <div className="card-buttons qty-group">
                      <button className="qty-btn" onClick={() => removeOne(key)}>
                        <FaMinus />
                      </button>
                      <span className="qty-display">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => addOne(key)}
                        disabled={item.quantity >= item.brand_stock}
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-box">
                <h2>Order Summary</h2>
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p>Shipping: ₹{shipping.toFixed(2)} (Free)</p>
                <p>Tax: ₹{tax.toFixed(2)}</p>
                <h3>Total: ₹{total.toFixed(2)}</h3>

                <button
                  className="start-shopping-btn"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? "⏳ Processing..." : "✅ Proceed to Checkout"}
                </button>

                <button
                  className="start-shopping-btn"
                  onClick={clearCart}
                  style={{ backgroundColor: "#ccc", color: "#333", marginTop: "10px" }}
                >
                  🗑️ Clear Cart
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
