import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SpeechProvider } from "./hooks/useSpeech";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as any).render(
  <React.StrictMode>
    <SpeechProvider>
      <App />
    </SpeechProvider>
  </React.StrictMode>
);
