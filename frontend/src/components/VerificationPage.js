// src/components/VerificationPage.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function VerificationPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [isValidToken, setIsValidToken] = useState(false);
    const [message, setMessage] = useState('Verifying link...');
    const [username, setUsername] = useState('');
    const [dob, setDob] = useState('');

    useEffect(() => {
        const checkToken = async () => {
            if (!token) {
                setMessage('❌ Invalid URL. No token provided.');
                return;
            }
            try {
                await axios.post('http://127.0.0.1:5001/verify-token', { token });
                setIsValidToken(true);
                setMessage('✅ Link is valid. Please enter your details.');
            } catch (error) {
                setIsValidToken(false);
                setMessage(`❌ ${error.response.data.message || 'Verification failed.'}`);
            }
        };
        checkToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://127.0.0.1:5001/submit-verification', {
                token,
                username,
                dob
            });
            setMessage(`✅ ${response.data.message}`);
            setIsValidToken(false); // Disable form after submission
        } catch (error) {
            setMessage(`❌ ${error.response.data.message || 'An error occurred.'}`);
        }
    };

    return (
        <div>
            <h2>User Identity Verification</h2>
            <p>{message}</p>
            {isValidToken && (
                <form onSubmit={handleSubmit}>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} placeholder="Date of Birth" required />
                    <button type="submit">Verify My Identity</button>
                </form>
            )}
        </div>
    );
}

export default VerificationPage;