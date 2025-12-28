import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Login() {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  // si ya está logueado sale del login
  useEffect(() => {
    if (store?.token) navigate("/", { replace: true });
  }, [store?.token, navigate]);

  // estados vacíos al entrar
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // error general (credenciales, server, etc.)
  const [error, setError] = useState("");

  // errores por campo
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validateField = (name, value) => {
    const v = (value ?? "").toString();
    const trimmed = v.trim();

    if (name === "email") {
      if (!trimmed) return "El email es obligatorio.";
      if (!trimmed.includes("@") || !trimmed.includes(".")) {
        return "Email no válido. Debe contener @ y .";
      }
      return "";
    }

    if (name === "password") {
      if (!v) return "La contraseña es obligatoria.";
      return "";
    }

    return "";
  };

  const validateForm = (nextEmail, nextPassword) => {
    const next = {
      email: validateField("email", nextEmail),
      password: validateField("password", nextPassword),
    };
    setFieldErrors(next);
    return !Object.values(next).some((msg) => msg);
  };

  const isInvalid = (name) => touched[name] && !!fieldErrors[name];

  const onBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const onEmailChange = (v) => {
    setEmail(v);
    setError("");

    if (touched.email) {
      setFieldErrors((prev) => ({ ...prev, email: validateField("email", v) }));
    }
  };

  const onPasswordChange = (v) => {
    setPassword(v);
    setError("");

    if (touched.password) {
      setFieldErrors((prev) => ({
        ...prev,
        password: validateField("password", v),
      }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // marcar tocados para mostrar errores
    setTouched({ email: true, password: true });

    const normalizedEmail = (email || "").trim();
    const isValid = validateForm(normalizedEmail, password);
    if (!isValid) return;

    try {
      const resp = await fetch(`${store.backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Login incorrecto");

      dispatch({
        type: "login_success",
        payload: { token: data.access_token, user: data.user },
      });

      // cargar carrito
      const cart = await fetch(`${store.backendUrl}/api/cart-items`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      }).then((r) => r.json());
      dispatch({ type: "set_cart", payload: cart });

      // manda al home
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Error de login");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h2 className="mb-3">Login</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={submit} className="card p-3" noValidate>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className={`form-control ${isInvalid("email") ? "is-invalid" : ""}`}
            name="email"
            type="email"
            value={email}
            placeholder="ejemplo@gmail.com"
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={onBlur}
            required
          />
          {isInvalid("email") && (
            <div className="invalid-feedback">{fieldErrors.email}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            className={`form-control ${
              isInvalid("password") ? "is-invalid" : ""
            }`}
            name="password"
            type="password"
            value={password}
            placeholder="contraseña"
            onChange={(e) => onPasswordChange(e.target.value)}
            onBlur={onBlur}
            required
          />
          {isInvalid("password") && (
            <div className="invalid-feedback">{fieldErrors.password}</div>
          )}
        </div>

        <button className="btn btn-primary" type="submit">
          Entrar
        </button>
      </form>
    </div>
  );
}
