import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { persistor, store } from "./store/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import "./index.css";
import Loader from "./pages/loader.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <PersistGate loading={<Loader />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
