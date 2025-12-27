"""
Rutas de la API con JWT y hash de contraseñas
"""
from flask import request, jsonify, Blueprint
from api.models import db, User, Product, CartItem
from flask_cors import CORS

# Seguridad
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

api = Blueprint('api', __name__)
CORS(api)

# ======================================
# RUTA DE PRUEBA
# ======================================
@api.route('/hello', methods=['GET'])
def hello():
    return jsonify({"message": "API funcionando correctamente"}), 200


# ======================================
# USUARIOS
# ======================================

# Crear usuario (registro)
@api.route('/register', methods=['POST'])
def create_user():
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email y password son requeridos"}), 400

    # Hashear contraseña
    hashed_password = generate_password_hash(data["password"])

    new_user = User(
        email=data["email"],
        password=hashed_password,
        is_active=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.serialize()), 201


# Login → devuelve JWT
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email y password son requeridos"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Credenciales inválidas"}), 401

    # 🔑 IMPORTANTE: identity DEBE SER STRING
    token = create_access_token(identity=str(user.id))

    return jsonify({"access_token": token}), 200


# Listar usuarios (sin protección por ahora)
@api.route('/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify([u.serialize() for u in users]), 200


# Actualizar usuario (solo el dueño)
@api.route('/users/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    current_user_id = int(get_jwt_identity())  # 🔧 convertir a int

    if current_user_id != id:
        return jsonify({"error": "No puedes modificar otro usuario"}), 403

    user = User.query.get(id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()

    user.email = data.get("email", user.email)

    if data.get("password"):
        user.password = generate_password_hash(data["password"])

    user.is_active = data.get("is_active", user.is_active)

    db.session.commit()
    return jsonify(user.serialize()), 200


# Borrar usuario (solo el dueño)
@api.route('/users/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    current_user_id = int(get_jwt_identity())  # 🔧 convertir a int

    if current_user_id != id:
        return jsonify({"error": "No puedes borrar otro usuario"}), 403

    user = User.query.get(id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Usuario eliminado"}), 200


# ======================================
# PRODUCTOS
# ======================================

@api.route('/products', methods=['POST'])
def create_product():
    data = request.get_json()

    if not data.get("title") or not data.get("price_cents"):
        return jsonify({"error": "title y price_cents son requeridos"}), 400

    product = Product(
        title=data["title"],
        description=data.get("description", ""),
        price_cents=data["price_cents"],
        image_url=data.get("image_url", "")
    )

    db.session.add(product)
    db.session.commit()

    return jsonify(product.serialize()), 201


@api.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([p.serialize() for p in products]), 200


# ======================================
# CARRITO
# ======================================

# Añadir item al carrito
@api.route('/cart-items', methods=['POST'])
@jwt_required()
def add_cart_item():
    data = request.get_json()
    current_user_id = int(get_jwt_identity())

    if not data.get("product_id"):
        return jsonify({"error": "product_id requerido"}), 400

    cart_item = CartItem(
        user_id=current_user_id,
        product_id=data["product_id"],
        quantity=data.get("quantity", 1)
    )

    db.session.add(cart_item)
    db.session.commit()

    return jsonify(cart_item.serialize()), 201


# Ver carrito del usuario logueado
@api.route('/cart-items', methods=['GET'])
@jwt_required()
def get_cart_items():
    current_user_id = int(get_jwt_identity())

    items = CartItem.query.filter_by(user_id=current_user_id).all()
    return jsonify([i.serialize() for i in items]), 200


# Actualizar cantidad
@api.route('/cart-items/<int:id>', methods=['PUT'])
@jwt_required()
def update_cart_item(id):
    current_user_id = int(get_jwt_identity())

    item = CartItem.query.get(id)
    if not item:
        return jsonify({"error": "Item no encontrado"}), 404

    if item.user_id != current_user_id:
        return jsonify({"error": "No autorizado"}), 403

    data = request.get_json()
    item.quantity = data.get("quantity", item.quantity)

    db.session.commit()
    return jsonify(item.serialize()), 200


# Borrar item
@api.route('/cart-items/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_cart_item(id):
    current_user_id = int(get_jwt_identity())

    item = CartItem.query.get(id)
    if not item:
        return jsonify({"error": "Item no encontrado"}), 404

    if item.user_id != current_user_id:
        return jsonify({"error": "No autorizado"}), 403

    db.session.delete(item)
    db.session.commit()

    return jsonify({"message": "Item eliminado"}), 200
