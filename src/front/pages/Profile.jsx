import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    lastname: "",
    address: "",
    email: "",
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // Borrado
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const loadMe = async () => {
    setErr("");
    setMsg("");

    try {
      const res = await fetch(`${store.backendUrl}/api/me`, {
        headers: { Authorization: `Bearer ${store.token}` },
      });
      
      //Si caduca el token hacemos logout y redirecionamos 
      
      if (res.status === 401) {
        dispatch({ type: "logout" });
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error /me: ${res.status} - ${t}`);
      }

      const data = await res.json();

      // guardamos user en store 
      dispatch({ type: "set_user", payload: data });

      setForm({
        name: data.name || "",
        lastname: data.lastname || "",
        address: data.address || "",
        email: data.email || "",
      });
    } catch (e) {
      setErr(e.message || "No se pudo cargar el perfil");
    }
  };

  useEffect(() => {
    if (!store.token) return;
    loadMe();
    
  }, [store.token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setMsg("");

    try {
      const res = await fetch(`${store.backendUrl}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify(form),
      });

      //Si caduca el token hacemos logout y redirecionamos 
      if (res.status === 401) {
        dispatch({ type: "logout" });
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error guardando: ${res.status} - ${t}`);
      }

      const updated = await res.json();
      dispatch({ type: "set_user", payload: updated });
      setMsg("Perfil actualizado ✅");
    } catch (e) {
      setErr(e.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setErr("");
    setMsg("");

    try {
      const res = await fetch(`${store.backendUrl}/api/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${store.token}` },
      });

      // Cuando caduca el token se cierra la sesion
      if (res.status === 401) {
        dispatch({ type: "logout" });
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error borrando: ${res.status} - ${t}`);
      }

      dispatch({ type: "logout" });
      navigate("/");
      alert("Cuenta eliminada definitivamente.");
    } catch (e) {
      setErr(e.message || "No se pudo borrar la cuenta");
    } finally {
      setDeleting(false);
      setShowDelete(false);
      setConfirmText("");
    }
  };

  if (!store.token) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          Tienes que iniciar sesión para ver tu perfil.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 720 }}>
      <h2 className="mb-3">Mi perfil</h2>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      <form className="card p-3 mb-4" onSubmit={saveProfile}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Apellidos</label>
            <input
              className="form-control"
              name="lastname"
              value={form.lastname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Dirección</label>
            <input
              className="form-control"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button className="btn btn-primary mt-3" disabled={saving}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <div className="card border-danger p-3">
        <h5 className="text-danger mb-2">Peligro</h5>
        <p className="mb-3">
          Si borras tu cuenta, se eliminará definitivamente y se borrará todo lo
          asociado (carrito, etc.).
        </p>

        {!showDelete ? (
          <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
            Borrar cuenta
          </button>
        ) : (
          <div className="bg-light p-3 rounded">
            <p className="mb-2 fw-semibold text-danger">
              ¿Estás seguro? Esto es definitivo.
            </p>
            <p className="mb-2">
              Escribe <strong>ACEPTO</strong> para confirmar:
            </p>

            <input
              className="form-control mb-2"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe ACEPTO"
            />

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowDelete(false);
                  setConfirmText("");
                }}
                disabled={deleting}
              >
                Cancelar
              </button>

              <button
                className="btn btn-danger"
                onClick={deleteAccount}
                disabled={deleting || confirmText.trim().toUpperCase() !== "ACEPTO"}
              >
                {deleting ? "Borrando..." : "Confirmar borrado"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
