import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AdminDashboard from ".src/AdminDashboard"; // ✅ import my file

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AdminDashboard />  {/* ✅ load the dashboard here */}
  </React.StrictMode>
);
