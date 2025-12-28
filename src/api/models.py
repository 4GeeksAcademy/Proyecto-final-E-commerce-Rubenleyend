from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

db = SQLAlchemy()

# -----------------------------
# Usuario
# -----------------------------
class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)

    # Perfil (opcionales)
    name: Mapped[str] = mapped_column(String(80), nullable=True)
    lastname: Mapped[str] = mapped_column(String(80), nullable=True)
    address: Mapped[str] = mapped_column(String(200), nullable=True)

    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    cart_items: Mapped[list["CartItem"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    # Pedidos del usuario
    orders: Mapped[list["Order"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "lastname": self.lastname,
            "address": self.address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# -----------------------------
# Producto
# -----------------------------
class Product(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text)
    price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    image_url: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    cart_items: Mapped[list["CartItem"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )

    # Relación con items de pedido
    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="product"
    )

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price_cents": self.price_cents,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# -----------------------------
# CartItem
# -----------------------------
class CartItem(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("product.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="cart_items")
    product: Mapped["Product"] = relationship(back_populates="cart_items")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "product": self.product.serialize() if self.product else None,
            "quantity": self.quantity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# -----------------------------
# Order
# -----------------------------
class Order(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)

    # total en céntimos para evitar problemas de decimales
    total_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    status: Mapped[str] = mapped_column(String(30), nullable=False, default="paid")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "total_cents": self.total_cents,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "items": [it.serialize() for it in self.items],
        }


# -----------------------------
# OrderItem
# -----------------------------
class OrderItem(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("order.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("product.id"), nullable=False)

    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # guardamos el precio en el momento de compra
    unit_price_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    order: Mapped["Order"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="order_items")

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "unit_price_cents": self.unit_price_cents,
            "product": self.product.serialize() if self.product else None,
        }
