import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { 
    HiOutlineCreditCard, 
    HiOutlineMagnifyingGlass 
} from "react-icons/hi2";

const idTypeList = [
    {
        title: "Aadhaar Verification",
        description: "Quickly extract Aadhaar card details with high accuracy.",
        icon: <HiOutlineCreditCard size={24} className="text-[#101828]" />,
        route: "/aadhaar",
    },
    {
        title: "PAN Verification",
        description: "Validate PAN details securely against government records.",
        icon: <HiOutlineCreditCard size={24} className="text-[#101828]" />,
        route: "/pan",
    },
];

export default function SelectVerificationType() {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    // --- CRUCIAL STEP FOR DYNAMIC DASHBOARD ---
    // Extract userId from the URL (sent via Email link)
    const queryParams = new URLSearchParams(location.search);
    const userId = queryParams.get("userId");

    // Define colors
    const primaryBlue = "#1570ef";
    const darkText = "#101828";
    const offWhiteBg = "#f8f9fa";
    const lightGray = "#f2f4f7";
    const borderGray = "#eaecf0";

    const filteredIdTypes = idTypeList.filter((id) =>
        id.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        id.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- NAVIGATION HANDLER ---
    const handleSelection = (route) => {
        // We append the userId to the next route so the Aadhaar/Pan components can use it
        navigate(`${route}?userId=${userId}`);
    };

    return (
        <div style={{backgroundColor: offWhiteBg}} className="min-h-screen flex items-center justify-center p-4 font-sans">
            <main className="max-w-4xl mx-auto w-full">
                <div 
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
                    style={{border: `1px solid ${borderGray}`, boxShadow: '0 8px 24px rgba(0,0,0,0.08)'}}
                >
                    <div className="text-center mb-10">
                        <h1 style={{color: darkText}} className="text-3xl font-bold">
                            Select Any ID for Verification
                        </h1>
                        <p className="text-gray-600 mt-2">
                            User Session ID: <span className="font-mono text-blue-600">{userId || "Guest"}</span>
                        </p>
                    </div>

                    <div className="flex justify-center mb-12">
                        <div className="relative w-full max-w-lg">
                            <HiOutlineMagnifyingGlass className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search verification type..."
                                style={{
                                    borderColor: borderGray, 
                                    transition: 'all 0.2s',
                                    outlineColor: primaryBlue,
                                }}
                                className="w-full pl-12 pr-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {filteredIdTypes.map((id, index) => (
                            <div
                                key={index}
                                style={{
                                    transition: 'all 0.2s ease-in-out',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                }}
                                className="group flex items-start gap-4 p-5 bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-blue-400 transform hover:-translate-y-1"
                                // Updated to use the selection handler
                                onClick={() => handleSelection(id.route)}
                            >
                                <div 
                                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg transition"
                                    style={{backgroundColor: lightGray, border: `1px solid ${borderGray}`}}
                                >
                                    {id.icon}
                                </div>
                                <div>
                                    <h2 style={{color: darkText}} className="text-lg font-semibold">{id.title}</h2>
                                    <p className="text-gray-600 text-sm mt-0.5">{id.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-gray-500 text-sm max-w-2xl mx-auto">
                        <p className="mb-1">All processes are secure, encrypted, and private.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}