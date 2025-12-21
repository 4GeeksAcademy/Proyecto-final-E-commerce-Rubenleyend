import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Single = () => {
  const { theId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${theId}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error(err));
  }, [theId]);

  if (!product) return <p>Cargando producto...</p>;

  return (
    <div>
      <h1>{product.title}</h1>
      <img src={product.image_url} alt={product.title} width="200" />
      <p>{product.description}</p>
      <p>Precio: {(product.price_cents / 100).toFixed(2)}€</p>
    </div>
  );
};

export default Single;

