import { useContext, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store";

// evita crasheos si falta Provider
const StoreContext = createContext({
  store: initialStore(),
  dispatch: () => {},
});

export function StoreProvider({ children }) {
  const [store, dispatch] = useReducer(storeReducer, initialStore());

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export default function useGlobalReducer() {
  const ctx = useContext(StoreContext);

 
  if (!ctx) return { store: initialStore(), dispatch: () => {} };

  return ctx;
}
