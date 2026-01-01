import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import UploadPage from "./UploadPage";
import Users from "./Users";
import Login from "./login";
import DocumentSelect from './DocumentSelect';
import Aadhaar from "./Aadhaar";
import Pan from "./Pan";
import Result from "./Result";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<AdminDashboard />}  />
        <Route path="/" element={<Login />} />
        <Route path="/user" element={<Users />} />
        <Route path="/upload" element={<UploadPage />} />
       <Route path="/id" element={<DocumentSelect />} />
<Route path="/aadhaar" element={<Aadhaar /> } />
<Route path="/pan" element={<Pan /> } />
<Route path="/result" element={<Result /> } />

      </Routes>
    </Router>
  );
}

export default App;
