import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import "./products.css";
import { FaSearch, FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : {};
  });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Fetch all products from view
  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error("Fetch products error:", err));
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    fetch(`http://localhost:5000/products/search?q=${query.trim()}`)
      .then((res) => res.json())
      .then((data) => setSearchResult(data.length ? data : []))
      .catch((err) => console.error("Search error:", err));
  };

  const saveCart = (updated) => {
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const addOne = (product) => {
    const key = `${product.product_name}_${product.brand_name}`;
    const qty = cart[key]?.quantity || 0;
    if (qty >= product.brand_stock) {
      setErrorMsg(`❌ "${product.product_name} (${product.brand_name})" is out of stock`);
      return;
    }
    setErrorMsg("");
    const updated = {
      ...cart,
      [key]: { ...product, quantity: qty + 1 },
    };
    saveCart(updated);
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

  const visible = searchResult !== null ? searchResult : products;

  return (
    <div className="page-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <div className="logo-icon-box">
            <FaShoppingCart className="logo-icon" />
          </div>
          <span className="logo-text">E‑Commerce Store</span>
        </div>

        <form
          className="search-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <input
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">
            <FaSearch />
          </button>
        </form>

        <nav className="dashboard-nav">
          <div className="nav-button"data-tooltip="Go to Home">
            <button onClick={() => navigate("/dashboard")}>🏠 Dashboard</button>
          </div>
          <div className="nav-button"data-tooltip="Go to cart">
            <button onClick={() => navigate("/cart")}>🛒 View Cart</button>
          </div>
        </nav>
      </header>

      <div className="main-scroll-container">
        <main className="products-main">
          <h1>All Products</h1>
          <p>Browse our complete collection</p>

          {errorMsg && <p className="error-msg">{errorMsg}</p>}

          <div className="product-grid">
            {visible.length ? (
              visible.map((p) => {
                const key = `${p.product_name}_${p.brand_name}`;
                const qty = cart[key]?.quantity || 0;
                const atMax = qty >= p.brand_stock;

                return (
                  <div className="product-card" key={key}>
                    <div className="product-img">🖼️</div>
                    <h2>{p.product_name}</h2>
                    <p className="brand">Brand: {p.brand_name}</p>
                    <p className="price">₹{parseFloat(p.price).toFixed(2)}</p>
                    <span className="stock">Stock: {p.brand_stock}</span>

                    <div className="card-buttons qty-group">
                      {qty === 0 ? (
                        <button className="cart-btn" onClick={() => addOne(p)}>
                          <FaShoppingCart /> Add
                        </button>
                      ) : (
                        <>
                          <button className="qty-btn" onClick={() => removeOne(key)}>
                            <FaMinus />
                          </button>
                          <span className="qty-display">{qty}</span>
                          <button
                            className="qty-btn"
                            onClick={() => addOne(p)}
                            disabled={atMax}
                          >
                            <FaPlus />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="not-found-msg">❌ No products found</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
