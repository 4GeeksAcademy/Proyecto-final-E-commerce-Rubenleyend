import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export default function Register() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    address: "",
    email: "",
    password: "",
  });

  // errores campo por campo
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    lastname: "",
    address: "",
    email: "",
    password: "",
  });

  // Para saber si el usuario ya ha tocado el campo
  const [touched, setTouched] = useState({
    name: false,
    lastname: false,
    address: false,
    email: false,
    password: false,
  });

  const [error, setError] = useState(""); // error 
  const [ok, setOk] = useState("");

  const RequiredStar = () => <span> *</span>;

  const validateField = (name, value, fullForm = form) => {
    const v = (value ?? "").toString();
    const trimmed = v.trim();

    switch (name) {
      case "name":
        if (!trimmed) return "El nombre es obligatorio.";
        return "";

      case "lastname":
        if (!trimmed) return "Los apellidos son obligatorios.";
        return "";

      case "address":
        if (!trimmed) return "La dirección es obligatoria.";
        return "";

      case "email": {
        const email = trimmed;
        if (!email) return "El email es obligatorio.";
        if (!email.includes("@") || !email.includes(".")) {
          return "Email no válido. Debe contener @ y .";
        }
        return "";
      }

      case "password":
        if (!v) return "La contraseña es obligatoria.";
        if (v.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
        return "";

      default:
        return "";
    }
  };

  const validateForm = (fullForm) => {
    const nextErrors = {
      name: validateField("name", fullForm.name, fullForm),
      lastname: validateField("lastname", fullForm.lastname, fullForm),
      address: validateField("address", fullForm.address, fullForm),
      email: validateField("email", fullForm.email, fullForm),
      password: validateField("password", fullForm.password, fullForm),
    };

    setFieldErrors(nextErrors);

    const hasAny = Object.values(nextErrors).some((msg) => msg);
    return !hasAny;
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      // si el usuario ya ha tocado el campo, validamos al escribir
      if (touched[name]) {
        setFieldErrors((prevErrs) => ({
          ...prevErrs,
          [name]: validateField(name, value, next),
        }));
      }

      // si cambia email/password, limpiamos error general
      if (error) setError("");
      if (ok) setOk("");

      // si el usuario corrige el email, quitamos el "email en uso" si existía
      if (name === "email" && fieldErrors.email) {
        // vuelve a validar
      }

      return next;
    });
  };

  const onBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, form),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    // mostrar errores
    setTouched({
      name: true,
      lastname: true,
      address: true,
      email: true,
      password: true,
    });

    const normalizedForm = { ...form, email: (form.email || "").trim() };

    const isValid = validateForm(normalizedForm);
    if (!isValid) return;

    try {
      // Register
      const resp = await fetch(`${store.backendUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedForm),
      });

      const data = await resp.json();

      if (!resp.ok) {
        if (resp.status === 409) {
          // Error email en uso
          setFieldErrors((prev) => ({
            ...prev,
            email: "Ese email ya está en uso. Prueba con otro.",
          }));
          return;
        }
        throw new Error(data?.error || "No se pudo registrar");
      }

      // Login automático
      const loginResp = await fetch(`${store.backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedForm.email,
          password: normalizedForm.password,
        }),
      });

      const loginData = await loginResp.json();
      if (!loginResp.ok) {
        throw new Error("Cuenta creada, pero error al iniciar sesión.");
      }

      dispatch({
        type: "login_success",
        payload: { token: loginData.access_token, user: loginData.user },
      });

      // cargar carrito
      const cart = await fetch(`${store.backendUrl}/api/cart-items`, {
        headers: { Authorization: `Bearer ${loginData.access_token}` },
      }).then((r) => r.json());
      dispatch({ type: "set_cart", payload: cart });

      setOk("Cuenta creada y sesión iniciada ✅");
      setTimeout(() => navigate("/"), 600);
    } catch (err) {
      setError(err.message || "Error");
    }
  };

  const isInvalid = (name) => touched[name] && !!fieldErrors[name];

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <h2 className="mb-3">Crear cuenta</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {ok && <div className="alert alert-success">{ok}</div>}

      <form onSubmit={submit} className="card p-3" noValidate>
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label">
              Nombre<RequiredStar />
            </label>
            <input
              className={`form-control ${isInvalid("name") ? "is-invalid" : ""}`}
              name="name"
              value={form.name}
              onChange={onChange}
              onBlur={onBlur}
              required
            />
            {isInvalid("name") && (
              <div className="invalid-feedback">{fieldErrors.name}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">
              Apellidos<RequiredStar />
            </label>
            <input
              className={`form-control ${isInvalid("lastname") ? "is-invalid" : ""}`}
              name="lastname"
              value={form.lastname}
              onChange={onChange}
              onBlur={onBlur}
              required
            />
            {isInvalid("lastname") && (
              <div className="invalid-feedback">{fieldErrors.lastname}</div>
            )}
          </div>
        </div>

        <div className="mt-2">
          <label className="form-label">
            Dirección<RequiredStar />
          </label>
          <input
            className={`form-control ${isInvalid("address") ? "is-invalid" : ""}`}
            name="address"
            value={form.address}
            onChange={onChange}
            onBlur={onBlur}
            required
          />
          {isInvalid("address") && (
            <div className="invalid-feedback">{fieldErrors.address}</div>
          )}
        </div>

        <div className="mt-2">
          <label className="form-label">
            Email<RequiredStar />
          </label>
          <input
            className={`form-control ${isInvalid("email") ? "is-invalid" : ""}`}
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            onBlur={onBlur}
            required
          />
          {isInvalid("email") && (
            <div className="invalid-feedback">{fieldErrors.email}</div>
          )}
        </div>

        <div className="mt-2">
          <label className="form-label">
            Contraseña<RequiredStar />
          </label>
          <input
            className={`form-control ${isInvalid("password") ? "is-invalid" : ""}`}
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            onBlur={onBlur}
            required
          />
          {isInvalid("password") ? (
            <div className="invalid-feedback">{fieldErrors.password}</div>
          ) : (
            <div className="form-text">Mínimo 6 caracteres.</div>
          )}
        </div>

        <button className="btn btn-primary mt-3" type="submit">
          Crear cuenta
        </button>
      </form>
    </div>
  );
}
