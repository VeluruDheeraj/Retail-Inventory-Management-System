from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Dheeraj@123',
    'database': 'user_login'
}

def get_db():
    return mysql.connector.connect(**DB_CONFIG)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s AND password=%s", (data['username'], data['password']))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if user:
        return jsonify({"message": "Login successful"}), 200
    return jsonify({"message": "Invalid credentials"}), 401

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (data['username'], data['password']))
        conn.commit()
    except mysql.connector.errors.IntegrityError:
        cursor.close()
        conn.close()
        return jsonify({"message": "Username already exists"}), 400
    cursor.close()
    conn.close()
    return jsonify({"message": "Registration successful"}), 200

@app.route("/products", methods=["GET"])
def products():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM product_brand_view")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products), 200

@app.route("/products/search", methods=["GET"])
def search_product():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify([]), 200
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM product_brand_view WHERE product_name LIKE %s OR brand_name LIKE %s",
        (f"%{query}%", f"%{query}%")
    )
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results), 200

@app.route("/dashboard", methods=["GET"])
def dashboard():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT name, stock FROM products WHERE category = 'fruit'")
    fruits = cursor.fetchall()
    cursor.execute("SELECT name, stock FROM products WHERE category = 'electronic'")
    electronics = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({"fruits": fruits, "electronics": electronics}), 200

# ✅ Updated /purchase endpoint using product_brands table
@app.route("/purchase", methods=["POST"])
def purchase():
    items = request.json.get("items", [])
    if not items:
        return jsonify({"error": "No items provided"}), 400

    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        for item in items:
            product_name = item["product_name"]
            brand_name = item["brand_name"]
            quantity = int(item["quantity"])

            # Step 1: Get product_brands record
            cursor.execute("""
                SELECT pb.id, pb.stock
                FROM product_brands pb
                JOIN products p ON pb.product_id = p.id
                JOIN brands b ON pb.brand_id = b.id
                WHERE p.name = %s AND b.name = %s
            """, (product_name, brand_name))

            row = cursor.fetchone()

            if not row:
                conn.rollback()
                return jsonify({"error": f"No matching product-brand pair for {product_name} ({brand_name})"}), 400

            if row["stock"] < quantity:
                conn.rollback()
                return jsonify({"error": f"Not enough stock for {product_name} ({brand_name})"}), 400

            # Step 2: Deduct stock
            cursor.execute("""
                UPDATE product_brands
                SET stock = stock - %s
                WHERE id = %s
            """, (quantity, row["id"]))

        conn.commit()
        return jsonify({"message": "Purchase successful"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)