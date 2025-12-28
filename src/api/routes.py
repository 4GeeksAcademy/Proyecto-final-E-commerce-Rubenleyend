"""
Rutas API (JWT + hash + perfil opcional + productos + carrito + STRIPE checkout)
"""
import os
import requests
from flask import request, jsonify, Blueprint
from src.api.models import db, User, Product, CartItem
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

# Stripe (asi si no esta instalado sigue funcinando)
try:
    import stripe
except ImportError:
    stripe = None

api = Blueprint("api", __name__)
CORS(api)

# ---------------------------
# STRIPE CONFIG
# ---------------------------
if stripe:
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

FRONTEND_URL = os.getenv("FRONTEND_URL", "").rstrip("/")

# ---------------------------
# TEST
# ---------------------------
@api.route("/hello", methods=["GET"])
def hello():
    return jsonify({"message": "API funcionando"}), 200

# ---------------------------
# AUTH
# ---------------------------
@api.route("/users", methods=["POST"])
def register_user():
    data = request.get_json() or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email y password son requeridos"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El email ya está registrado"}), 409

    hashed = generate_password_hash(password)

    user = User(
        email=email,
        password=hashed,
        is_active=True,
        name=data.get("name"),
        lastname=data.get("lastname"),
        address=data.get("address"),
    )
    db.session.add(user)
    db.session.commit()

    return jsonify(user.serialize()), 201


@api.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email y password son requeridos"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": user.serialize()}), 200


@api.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user.serialize()), 200


@api.route("/me", methods=["PUT"])
@jwt_required()
def update_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json() or {}

    if "name" in data:
        user.name = data["name"]
    if "lastname" in data:
        user.lastname = data["lastname"]
    if "address" in data:
        user.address = data["address"]

    if "email" in data and data["email"]:
        existing = User.query.filter(User.email == data["email"], User.id != user.id).first()
        if existing:
            return jsonify({"error": "Ese email ya está en uso"}), 409
        user.email = data["email"]

    if "password" in data and data["password"]:
        user.password = generate_password_hash(data["password"])

    db.session.commit()
    return jsonify(user.serialize()), 200


@api.route("/me", methods=["DELETE"])
@jwt_required()
def delete_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Cuenta eliminada"}), 200


# ---------------------------
# USERS (dev)
# ---------------------------
@api.route("/users", methods=["GET"])
def list_users():
    users = User.query.all()
    return jsonify([u.serialize() for u in users]), 200


# ---------------------------
# PRODUCTS
# ---------------------------
@api.route("/products", methods=["POST"])
def create_product():
    data = request.get_json() or {}

    if not data.get("title") or data.get("price_cents") is None:
        return jsonify({"error": "title y price_cents son requeridos"}), 400

    product = Product(
        title=data["title"],
        description=data.get("description", ""),
        price_cents=int(data["price_cents"]),
        image_url=data.get("image_url", ""),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.serialize()), 201


@api.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([p.serialize() for p in products]), 200


@api.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product.serialize()), 200


@api.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json() or {}
    if "title" in data:
        product.title = data["title"]
    if "description" in data:
        product.description = data["description"]
    if "price_cents" in data:
        product.price_cents = int(data["price_cents"])
    if "image_url" in data:
        product.image_url = data["image_url"]

    db.session.commit()
    return jsonify(product.serialize()), 200


@api.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"}), 200


# ---------------------------
# CART
# ---------------------------
@api.route("/cart-items", methods=["GET"])
@jwt_required()
def get_cart_items():
    user_id = int(get_jwt_identity())
    items = CartItem.query.filter_by(user_id=user_id).all()
    return jsonify([i.serialize() for i in items]), 200


@api.route("/cart-items", methods=["POST"])
@jwt_required()
def add_cart_item():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    product_id = data.get("product_id")
    quantity = int(data.get("quantity", 1))

    if not product_id:
        return jsonify({"error": "product_id es requerido"}), 400

    product = Product.query.get(int(product_id))
    if not product:
        return jsonify({"error": "Producto no existe"}), 404

    item = CartItem.query.filter_by(user_id=user_id, product_id=product.id).first()
    if item:
        item.quantity += quantity
    else:
        item = CartItem(user_id=user_id, product_id=product.id, quantity=quantity)
        db.session.add(item)

    db.session.commit()
    return jsonify(item.serialize()), 201


@api.route("/cart-items/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_cart_item(item_id):
    user_id = int(get_jwt_identity())
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({"error": "CartItem not found"}), 404

    if item.user_id != user_id:
        return jsonify({"error": "No puedes modificar el carrito de otro usuario"}), 403

    data = request.get_json() or {}
    if "quantity" in data:
        item.quantity = max(1, int(data["quantity"]))

    db.session.commit()
    return jsonify(item.serialize()), 200


@api.route("/cart-items/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_cart_item(item_id):
    user_id = int(get_jwt_identity())
    item = CartItem.query.get(item_id)
    if not item:
        return jsonify({"error": "CartItem not found"}), 404

    if item.user_id != user_id:
        return jsonify({"error": "No puedes borrar items de otro usuario"}), 403

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "CartItem deleted"}), 200


# ---------------------------
# STRIPE CHECKOUT SESSION (PAGO)
# ---------------------------
@api.route("/checkout-session", methods=["POST"])
@jwt_required()
def create_checkout_session():
    if stripe is None:
        return jsonify({"error": "Stripe no está instalado en el backend. Añade 'stripe' a requirements.txt"}), 500

    if not stripe.api_key:
        return jsonify({"error": "Stripe no está configurado (falta STRIPE_SECRET_KEY)"}), 500

    if not FRONTEND_URL:
        return jsonify({"error": "Falta FRONTEND_URL en el backend"}), 500

    user_id = int(get_jwt_identity())
    items = CartItem.query.filter_by(user_id=user_id).all()
    if not items:
        return jsonify({"error": "El carrito está vacío"}), 400

    line_items = []
    for it in items:
        if not it.product:
            continue
        line_items.append({
            "quantity": int(it.quantity or 1),
            "price_data": {
                "currency": "eur",
                "unit_amount": int(it.product.price_cents),
                "product_data": {"name": it.product.title},
            },
        })

    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=line_items,
            success_url=f"{FRONTEND_URL}/checkout/success",
            cancel_url=f"{FRONTEND_URL}/checkout/cancel",
        )
        return jsonify({"url": session.url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------
# Limpia el carrito despues del pago
# ---------------------------
@api.route("/checkout/success", methods=["POST"])
@jwt_required()
def checkout_success():
    user_id = int(get_jwt_identity())

    items = CartItem.query.filter_by(user_id=user_id).all()
    cleared = len(items)

    for it in items:
        db.session.delete(it)

    db.session.commit()
    return jsonify({"message": "Carrito vaciado ✅", "cleared": cleared}), 200


# ---------------------------
# Importa productos desde API pública (DummyJSON) y los guarda BD
# ---------------------------
@api.route("/import-products", methods=["POST"])
def import_products():
    """
    Descarga productos desde DummyJSON y los guarda en tu tabla Product.

    Body opcional:
    - replace: true/false (si true, borra productos antes de importar)
    - limit: número (por defecto 50)
    """
    payload = request.get_json(silent=True) or {}
    replace = bool(payload.get("replace", False))
    limit = int(payload.get("limit", 50))

    if replace:
        Product.query.delete()
        db.session.commit()
    else:
        existing = Product.query.count()
        if existing > 0:
            return jsonify({
                "message": "Ya hay productos en la BD, no se importó nada (usa replace=true)",
                "count": existing
            }), 200

    try:
        r = requests.get(f"https://dummyjson.com/products?limit={limit}", timeout=20, headers={
            "User-Agent": "Mozilla/5.0 (Marketly Importer)",
            "Accept": "application/json",
        })
        r.raise_for_status()
        payload = r.json()
        data = payload.get("products", [])
    except Exception as e:
        return jsonify({"error": f"No se pudo leer DummyJSON: {str(e)}"}), 502

    created = 0
    for p in data:
        price = p.get("price", 0) or 0
        try:
            price_cents = int(round(float(price) * 100))
        except Exception:
            price_cents = 0

        product = Product(
            title=(p.get("title") or "Producto sin título")[:200],
            description=(p.get("description") or "")[:2000],
            price_cents=price_cents,
            image_url=p.get("thumbnail", "") or "",
        )
        db.session.add(product)
        created += 1

    db.session.commit()
    return jsonify({"message": "Productos importados ✅", "count": created}), 201
