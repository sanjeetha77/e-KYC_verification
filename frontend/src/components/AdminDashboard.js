// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
    const [link, setLink] = useState('');
    const [verifiedUsers, setVerifiedUsers] = useState([]);

    const fetchVerifiedUsers = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5001/get-verified-users');
            setVerifiedUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch users when the component loads and every 5 seconds
    useEffect(() => {
        fetchVerifiedUsers();
        const interval = setInterval(fetchVerifiedUsers, 5000);
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const generateLink = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5001/generate-token');
            const token = response.data.token;
            // The frontend URL for verification
            const verificationUrl = `http://localhost:3000/verify?token=${token}`;
            setLink(verificationUrl);
        } catch (error) {
            console.error("Error generating link:", error);
        }
    };

    return (
        <div>
            <h2>Admin Dashboard</h2>
            <button onClick={generateLink}>Generate Verification Link</button>
            {link && (
                <div>
                    <p><strong>Generated Link (copy and paste this in a new tab):</strong></p>
                    <input type="text" value={link} readOnly style={{ width: '100%', padding: '8px' }}/>
                </div>
            )}
            <hr />
            <h3>Verified Users</h3>
            {verifiedUsers.length > 0 ? (
                <ul>
                    {verifiedUsers.map((user, index) => (
                        <li key={index}>
                            <strong>Username:</strong> {user.username} | <strong>DOB:</strong> {user.dob}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users have been verified yet.</p>
            )}
        </div>
    );
}

export default AdminDashboard;