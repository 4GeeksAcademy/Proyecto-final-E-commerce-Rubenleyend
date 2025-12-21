import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div>
      <h1>Productos</h1>
      {products.map(p => (
        <div key={p.id}>
          <Link to={`/single/${p.id}`}>{p.title}</Link>
        </div>
      ))}
    </div>
  );
};

export default Home;

