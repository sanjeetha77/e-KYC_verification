import React, { useState, useRef, useEffect } from "react";
import {
  HiOutlineUser,
  HiDocumentText,
  HiOutlineClipboardList,
  HiOutlineChartPie,
  HiOutlineTrendingUp,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiChevronLeft,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineTrash
} from "react-icons/hi";
import Result from "./Result"; // Assumes Result.jsx is in the same directory

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // --- NEW STATE FOR REPORT NAVIGATION ---
  const [activePage, setActivePage] = useState("Overview");
  const [selectedUserReport, setSelectedUserReport] = useState(null);
  
  // Form State
  const [newUsername, setNewUsername] = useState("");
  const [newDOB, setNewDOB] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newMobile, setNewMobile] = useState("");
  

  const BACKEND_URL = "http://localhost:5000";

  // --- CALCULATE STATS FOR OVERVIEW ---
  const totalUsers = users.length;
  const verifiedCount = users.filter(u => u.status === "Verified").length;
  const pendingCount = users.filter(u => u.status === "Pending").length;
  const failedCount = users.filter(u => u.status === "Invalid" || u.status === "Failed").length;

  // --- 1. FETCH USERS FROM MONGODB ---
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/get-verified-users`);
      if (res.ok) {
        const data = await res.json();
        setUsers((prevUsers) => {
  // Keep local draft users that are not yet in DB
        const localDrafts = prevUsers.filter(
        (u) => u._localDraft && !data.find(dbUser => dbUser.userId === u.userId)
  );

  return [...data, ...localDrafts];
});
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Poll database every 5 seconds to check for verification updates
  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. ADD USER (Local State Only) ---
  const handleAddUser = () => {
    if (!newUsername || !newDOB || !newEmail || !newMobile) return;
    
    const newUser = {
      userId: Date.now().toString(), 
      username: newUsername,
      dob: newDOB,
      email: newEmail,
      mobile: newMobile,
      status: "Draft", 
      score: null,
     _localDraft: true,

    };

    setUsers((prev) => [...prev, newUser]);
    
    setNewUsername("");
    setNewDOB("");
    setNewEmail("");
    setNewMobile("");
    setShowForm(false);

    // FIX: Switch page to User Management so the table is visible
    setActivePage("User Management");
  };

  // --- 3. SEND VERIFICATION LINK ---
  const handleSendLink = async (user) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/send-verification-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          dob: user.dob,
          userId: user.userId, 
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Verification link sent to ${user.email}`);
        fetchUsers(); 
      } else {
        alert("Failed to send link: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error sending link:", err);
      alert("Network error: Could not reach backend.");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: CANCEL TASK / DELETE USER LOGIC ---
  const handleCancelTask = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently remove this user?")) return;

    try {
      // Optimistic update: remove from local UI immediately
      setUsers((prev) => prev.filter((user) => user.userId !== userId));

      const res = await fetch(`${BACKEND_URL}/delete-user/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to remove user from database. Please try again.");
        fetchUsers(); // Refresh to restore if delete failed
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      fetchUsers();
    }
  };

  // --- 4. VIEW REPORT HANDLER (Updated logic to handle PAN and Aadhaar dynamically) ---
  const handleViewReport = (user) => {
    // Detect document type: PAN (usually 10 chars), Aadhaar (usually 12 chars)
    let docType = "Aadhaar";
    if (user.id_number && user.id_number.toString().replace(/\s/g, "").length === 10) {
        docType = "PAN";  
    }  

    const kycResults = [
      { step: "Face Presence Check", status: "success", message: "Face detected on ID." },
      { step: "Information Extraction (OCR)", status: "success", message: `${docType} Number: ${user.id_number || 'Extracted'}` },
      { step: "Tamper Checks", status: (user.score && user.score > 50) ? "success" : "review", message: "ID card appears authentic." },
      { step: "Live Face Match", status: user.status === "Verified" ? "success" : "failed", message: `Match Score: ${user.score}%` }
    ];

    setSelectedUserReport({
      idType: docType,
      results: kycResults,
      username: user.username,
      score: user.score
    });
    setActivePage("Reports");
  };

  const menuItems = [
    { name: "Overview", icon: <HiOutlineTrendingUp size={22} /> },
    { name: "User Management", icon: <HiOutlineUser size={22} /> },
    { name: "Documents", icon: <HiDocumentText size={22} /> },
    { name: "Verification Queue", icon: <HiOutlineClipboardList size={22} /> },
    { name: "Reports", icon: <HiOutlineChartPie size={22} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between shadow-lg fixed h-full z-10">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-cyan-500/10 p-2 rounded-lg">
                <HiOutlineChartPie size={32} className="text-cyan-400" />
            </div>
            <span className="text-xl font-bold tracking-wide">SecureKYC</span>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 ${
                  activePage === item.name
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/50"
                    : "hover:bg-gray-800 text-gray-400 hover:text-white"
                }`}
                onClick={() => {
                    setActivePage(item.name);
                    if (item.name !== "Reports") setSelectedUserReport(null);
                }}
              >
                <span>{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">System Status</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-400">Online</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8 relative">
        <div className={`${showForm ? "opacity-30 pointer-events-none transition-opacity" : "transition-opacity"}`}>
          
          {/* Top Navbar */}
          <div className="flex justify-between items-center mb-8 bg-white shadow-sm border-b border-gray-200 px-8 py-4 rounded-xl">
            <h1 className="text-2xl font-bold text-gray-800">{activePage}</h1>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                A
              </div>
            </div>
          </div>

          {/* PAGE ROUTING CONTENT */}
          
          {/* 1. OVERVIEW PAGE */}
          {activePage === "Overview" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <HiOutlineUser className="text-blue-500 mb-2" size={24}/>
                  <p className="text-gray-500 text-sm font-medium">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <HiOutlineShieldCheck className="text-green-500 mb-2" size={24}/>
                  <p className="text-gray-500 text-sm font-medium">Verified</p>
                  <h3 className="text-2xl font-bold text-gray-900">{verifiedCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <HiOutlineClock className="text-yellow-500 mb-2" size={24}/>
                  <p className="text-gray-500 text-sm font-medium">Pending</p>
                  <h3 className="text-2xl font-bold text-gray-900">{pendingCount}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <HiOutlineXCircle className="text-red-500 mb-2" size={24}/>
                  <p className="text-gray-500 text-sm font-medium">Failed</p>
                  <h3 className="text-2xl font-bold text-gray-900">{failedCount}</h3>
                </div>
              </div>
            </div>
          )}

          {/* 2. DOCUMENTS PAGE */}
          {activePage === "Documents" && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Document Audit Storage</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {users.filter(u => u.status === "Verified").map(user => (
                  <div key={user.userId} className="group border border-gray-100 rounded-2xl p-4 hover:border-cyan-200 hover:shadow-lg transition-all bg-gray-50/50">
                    <div className="bg-white h-40 rounded-xl mb-4 flex items-center justify-center border border-gray-100 group-hover:bg-cyan-50 transition-colors relative">
                      <HiDocumentText className="text-gray-300 group-hover:text-cyan-400 transition-colors" size={48}/>
                      <button 
                        onClick={() => handleCancelTask(user.userId)}
                        className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        title="Permanently Remove"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                    <p className="font-bold text-gray-800 text-sm truncate">{user.username}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {user.id_number}</p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <span className="text-[10px] font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded uppercase">
                         {user.id_number && user.id_number.toString().replace(/\s/g, "").length === 10 ? "PAN" : "AADHAAR"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">JPG Format</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. VERIFICATION QUEUE PAGE */}
          {activePage === "Verification Queue" && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Waiting for Completion</h2>
                  <p className="text-gray-500 text-sm">Users who have received the link but haven't finished KYC.</p>
                </div>
                <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl border border-yellow-100 font-bold text-sm">
                  {pendingCount} Tasks Remaining
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {users.filter(u => u.status === "Pending").map(user => (
                  <div key={user.userId} className="flex items-center justify-between p-5 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                        <HiOutlineClock size={24}/>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleCancelTask(user.userId)}
                        className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition-colors"
                       >
                        Cancel Task
                       </button>
                       <button onClick={() => handleSendLink(user)} className="px-4 py-2 text-xs font-bold bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors shadow-sm">Send Reminder</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. USER MANAGEMENT PAGE */}
          {activePage === "User Management" && (
            <div className="bg-white shadow-xl shadow-gray-200/50 p-8 rounded-2xl border border-gray-100 animate-in fade-in duration-500">
              <div className="flex justify-between items-end mb-6">
                  <div>
                      <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                      <p className="text-gray-500 text-sm mt-1">Manage KYC requests and view verification scores.</p>
                  </div>
                  <div className="flex gap-3">
                      <button onClick={fetchUsers} className="p-2 text-gray-500 hover:text-blue-600 rounded-lg"><HiOutlineRefresh size={20} /></button>
                      <button className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg" onClick={() => setShowForm(true)}><HiOutlineUser size={18}/> Add New User</button>
                  </div>
              </div>

              <div className="overflow-hidden shadow-sm border border-gray-200 rounded-xl">
              <table className="w-full table-auto text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
                  <tr>
                      <th className="py-4 px-6">User Details</th>
                      <th className="py-4 px-6">Contact Info</th>
                      <th className="py-4 px-6 text-center">Trust Score</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                  {users.map((user) => (
                      <tr key={user.userId || Math.random()} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                      <td className="py-4 px-6">
                          <div>
                              <p className="font-semibold text-gray-900 text-base">{user.username}</p>
                              <p className="text-xs text-gray-500">DOB: {user.dob}</p>
                          </div>
                      </td>
                      <td className="py-4 px-6">
                          <div className="flex flex-col gap-0.5">
                              <span className="text-gray-700 font-medium">{user.email}</span>
                              <span className="text-gray-400 text-xs">{user.mobile}</span>
                          </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                          {user.score !== null && user.score !== undefined ? (
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-sm
                                  ${user.score >= 80 ? 'bg-green-100 text-green-700' : 
                                  user.score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                  {user.score >= 80 ? <HiOutlineCheckCircle /> : <HiOutlineXCircle />} {user.score}%
                              </div>
                          ) : <span className="text-gray-300 font-bold">-</span>}
                      </td>
                      <td className="py-4 px-6 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border
                              ${user.status === "Verified" ? "bg-green-50 text-green-600 border-green-200" : 
                              user.status === "Pending" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
                              "bg-gray-100 text-gray-500 border-gray-200"}`}>
                          {user.status === "Pending" && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5 animate-pulse mt-1"></span>}
                          {user.status || "Draft"}
                          </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === "Verified" ? (
                              <button onClick={() => handleViewReport(user)} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all active:scale-95">View Report</button>
                          ) : (
                              <button className="bg-cyan-600 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50" onClick={() => handleSendLink(user)} disabled={loading}>
                                  {loading ? "Sending..." : "Send Link"}
                              </button>
                          )}
                          <button 
                            onClick={() => handleCancelTask(user.userId)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove User Permanently"
                          >
                             <HiOutlineTrash size={18} />
                          </button>
                        </div>
                      </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
              </div>
            </div>
          )}

          {/* 5. REPORTS PAGE (Detailed View) */}
          {activePage === "Reports" && selectedUserReport ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => {setActivePage("User Management"); setSelectedUserReport(null);}}
                  className="mb-4 flex items-center gap-2 text-cyan-600 font-bold hover:underline"
                >
                  <HiChevronLeft /> Back to User Management
                </button>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                        <p className="text-xs text-gray-400 uppercase font-black tracking-widest">Reports / {selectedUserReport.username}</p>
                        <span className="text-sm font-bold text-blue-600">Verification ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    {/* Inject Result Component */}
                    <Result 
                        idType={selectedUserReport.idType} 
                        results={selectedUserReport.results} 
                        onBackToUpload={() => setActivePage("User Management")}
                    />
                </div>
            </div>
          ) : activePage === "Reports" && (
            <div className="bg-white p-20 rounded-2xl text-center border-2 border-dashed border-gray-200 shadow-inner">
                <HiOutlineChartPie size={64} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-700">No Report Data Available</h3>
                <p className="text-gray-500 mt-2">Select a verified user from the management list to generate a detailed KYC report.</p>
                <button 
                  onClick={() => setActivePage("User Management")}
                  className="mt-6 bg-cyan-600 text-white px-6 py-2 rounded-lg font-bold"
                >
                  View Users
                </button>
            </div>
          )}
        </div>

        {/* Modal Overlay for Add User */}
        {showForm && (
          <>
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setShowForm(false)}></div>
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px] flex flex-col gap-4 animate-in fade-in zoom-in duration-200 pointer-events-auto border border-gray-100">
                <div className="mb-2">
                    <h3 className="text-xl font-bold text-gray-900">Add New User</h3>
                    <p className="text-gray-500 text-sm">Enter details to initiate verification.</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Username</label>
                      <input
                          type="text"
                          placeholder="e.g. John Doe"
                          className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          autoFocus
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Birth</label>
                      <input
                          type="date"
                          className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-lg px-4 py-2.5 outline-none transition-all text-sm text-gray-600"
                          value={newDOB}
                          onChange={(e) => setNewDOB(e.target.value)}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                      <input
                          type="email"
                          placeholder="john@example.com"
                          className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number</label>
                      <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="w-full border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 rounded-lg px-4 py-2.5 outline-none transition-all text-sm"
                          value={newMobile}
                          onChange={(e) => setNewMobile(e.target.value)}
                      />
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-2 border-t border-gray-100">
                  <button
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold transition-colors"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
                    onClick={handleAddUser}
                  >
                    Add User
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}