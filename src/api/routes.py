"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email y password son requeridos"}), 400

    # Crear usuario
    new_user = User(
        email=data["email"],
        password=data["password"],  # encriptar
        is_active=True
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.serialize()), 201

@api.route('/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

# Crear Producto

@api.route('/products', methods=['POST'])
def create_product():
    data = request.get_json()  # Obtenemos los datos enviados desde el frontend
    if not data.get('title') or not data.get('price_cents'):
        return jsonify({"error": "title and price_cents are required"}), 400

    product = Product(
        title=data['title'],
        description=data.get('description', ''),
        price_cents=data['price_cents'],
        image_url=data.get('image_url', '')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.serialize()), 201

# Listar todos los productos

@api.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()  # Trae todos los productos
    return jsonify([p.serialize() for p in products])

# Obtener un producto po ID

@api.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product.serialize())

# Actualizar un producto

@api.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()
    product.title = data.get('title', product.title)
    product.description = data.get('description', product.description)
    product.price_cents = data.get('price_cents', product.price_cents)
    product.image_url = data.get('image_url', product.image_url)

    db.session.commit()
    return jsonify(product.serialize())

# Borrar un producto

@api.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"})

# Crea un cardtItem

@api.route('/cart-items', methods=['POST'])
def add_cart_item():
    data = request.get_json()
    if not data.get('user_id') or not data.get('product_id'):
        return jsonify({"error": "user_id and product_id are required"}), 400

    cart_item = CartItem(
        user_id=data['user_id'],
        product_id=data['product_id'],
        quantity=data.get('quantity', 1)
    )
    db.session.add(cart_item)
    db.session.commit()
    return jsonify(cart_item.serialize()), 201

# Lista todos los CartItems

@api.route('/cart-items', methods=['GET'])
def get_cart_items():
    items = CartItem.query.all()
    return jsonify([item.serialize() for item in items])

# Actualiza la cantidad en el carrito

@api.route('/cart-items/<int:id>', methods=['PUT'])
def update_cart_item(id):
    item = CartItem.query.get(id)
    if not item:
        return jsonify({"error": "CartItem not found"}), 404

    data = request.get_json()
    item.quantity = data.get('quantity', item.quantity)
    db.session.commit()
    return jsonify(item.serialize())

# Borra un item del carrito

@api.route('/cart-items/<int:id>', methods=['DELETE'])
def delete_cart_item(id):
    item = CartItem.query.get(id)
    if not item:
        return jsonify({"error": "CartItem not found"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "CartItem deleted"})













