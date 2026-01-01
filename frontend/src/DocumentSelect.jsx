import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
    HiOutlineCreditCard, 
    HiOutlineMagnifyingGlass,
    HiOutlineTruck,          // Added for Driving Licence
    HiOutlineIdentification  // Added for Voter ID
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
    {
        title: "Driving Licence",
        description: "Verify driving licence status and holder details instantly.",
        icon: <HiOutlineTruck size={24} className="text-[#101828]" />,
        route: "/driving-licence",
    },
    {
        title: "Voter ID Verification",
        description: "Authenticate voter identity using EPIC number lookup.",
        icon: <HiOutlineIdentification size={24} className="text-[#101828]" />,
        route: "/voter-id",
    },
];

export default function SelectVerificationType() {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    // Get current URL parameters (token & userId) to pass them along
    const [searchParams] = useSearchParams();

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

    // Helper function to keep the token/userId in the URL when navigating
    const handleNavigation = (route) => {
        const currentParams = searchParams.toString();
        // If we have params, append them. Otherwise just go to route.
        const targetUrl = currentParams ? `${route}?${currentParams}` : route;
        navigate(targetUrl);
    };

    return (
        <div style={{backgroundColor: offWhiteBg}} className="min-h-screen flex items-center justify-center p-4 font-sans">
            
            <main className="max-w-4xl mx-auto w-full">
                
                {/* INTERFACE BOX CONTAINER */}
                <div 
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-12" 
                    style={{border: `1px solid ${borderGray}`, boxShadow: '0 8px 24px rgba(0,0,0,0.08)'}} 
                >

                    {/* Header section */}
                    <div className="text-center mb-10">
                        <h1 style={{color: darkText}} className="text-3xl font-bold">
                            Select Any ID for Verification
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Choose an option below to securely verify or extract information from your ID documents.
                        </p>
                    </div>

                    {/* Search */}
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

                    {/* ID Type Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {filteredIdTypes.map((id, index) => (
                            <div
                                key={index}
                                style={{
                                    transition: 'all 0.2s ease-in-out',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                }}
                                className="group flex items-start gap-4 p-5 bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-blue-400 transform hover:-translate-y-1"
                                onClick={() => handleNavigation(id.route)}
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

                    {/* Footer Text */}
                    <div className="mt-12 text-center text-gray-500 text-sm max-w-2xl mx-auto">
                        <p className="mb-1">
                            Our platform ensures fast and accurate verification for official documents.
                        </p>
                        <p>
                            Whether you need Aadhaar OCR or PAN verification, all processes are secure, encrypted, and private.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}