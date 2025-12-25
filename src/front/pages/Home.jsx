import { useCart } from "../context/CartContext";

export default function Home() {
  const { cart, addToCart } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Productos</h1>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.title} - ${p.price_cents / 100} 
            <button onClick={() => addToCart(p)}>Añadir al carrito</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
