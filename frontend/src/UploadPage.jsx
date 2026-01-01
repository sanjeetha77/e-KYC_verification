import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function UploadPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { docType, token, userId } = location.state || {};
  const [file, setFile] = useState(null);

  const instructions = {
    PAN: "Ensure your PAN card is clearly visible.",
    AADHAAR: "Ensure your Aadhaar number and name are clearly visible.",
    PASSPORT: "Upload the main page of your passport.",
  };

  const handleUpload = () => {
    if (!file) {
      alert("Please select a file");
      return;
    }
    navigate("/verify", { state: { docType, file, token, userId } });
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-8 gap-4">
      {/* Left: Instructions */}
      <div className="w-1/2 bg-white p-6 shadow rounded">
        <h3 className="text-lg font-bold mb-2">Instructions</h3>
        <p>{instructions[docType]}</p>
      </div>

      {/* Right: Upload */}
      <div className="w-1/2 bg-white p-6 shadow rounded flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold mb-2">{docType} Upload</h3>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4"
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={handleUpload}
        >
          Upload & Verify
        </button>
      </div>
    </div>
  );
}
