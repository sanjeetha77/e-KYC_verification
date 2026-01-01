import React, { useState } from 'react';

// --- STYLES DEFINITION (Updated to match Pan/Aadhaar success/fail colors) ---
const primaryColor = '#101828'; // Dark Gray
const passColor = '#1570ef'; // Blue (matches component success color)
const reviewColor = '#f79009'; // Orange for Review
const failColor = '#d92d20'; // Red (matches component failed color)

const styles = {
    body: {
        margin: 0,
        fontFamily: 'Inter, sans-serif',
        backgroundColor: '#f5f7fa',
        color: '#333',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        backgroundColor: '#ffffff',
        padding: '12px 30px', 
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerH1: {
        fontSize: '20px',
        fontWeight: 600,
        color: primaryColor,
        margin: 0,
    },
    step: {
        fontSize: '14px',
        color: '#666',
    },
    container: {
        maxWidth: '1500px',
        margin: 'auto',
        padding: '40px',
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap',
        flexGrow: 1,
    },
    scoreBox: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        padding: '30px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: '380px',
        minHeight: '320px',
    },
    scoreCircle: (color) => ({
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        border: `8px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        color: color,
        margin: 'auto',
    }),
    scoreBoxP: {
        marginTop: '15px',
        fontSize: '16px',
        color: '#555',
    },
    verifiedBadge: (bgColor) => ({
        marginTop: '12px',
        display: 'inline-block',
        backgroundColor: bgColor,
        color: 'white',
        padding: '6px 14px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 600,
        alignSelf: 'center',
    }),
    summaryBox: {
        flex: 2,
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
        padding: '30px',
        minWidth: '700px',
        minHeight: '420px',
    },
    summaryBoxH2: {
        fontSize: '20px',
        marginBottom: '20px',
        color: primaryColor,
        margin: 0,
        fontWeight: 600,
    },
    summaryRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    checkCard: {
        backgroundColor: '#f9fafb',
        borderRadius: '10px',
        padding: '16px 20px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column', // Allow details below
    },
    checkHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    checkTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    checkTitleH3: {
        fontSize: '16px',
        margin: 0,
        color: '#333',
        fontWeight: 500,
    },
    status: (bgColor) => ({
        padding: '6px 14px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        backgroundColor: bgColor,
        color: 'white',
    }),
    detailsButton: {
        background: 'none',
        border: 'none',
        color: passColor, // Use the blue color for the button text
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        padding: '0 8px',
        marginLeft: '10px',
        textDecoration: 'underline',
        transition: 'color 0.2s',
    },
    detailsBox: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0eaff',
        borderRadius: '6px',
        whiteSpace: 'pre-wrap', // Preserve formatting for JSON/text output
        fontSize: '14px',
        color: '#475467',
    },
    footer: {
        textAlign: 'center',
        padding: '20px',
        fontSize: '13px',
        color: '#777',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        marginTop: '40px',
        width: '100%',
        boxSizing: 'border-box',
    },
};

// --- HELPER FUNCTIONS ---
const getStatusInfo = (status) => {
    switch (status) {
        case 'success':
            return { label: 'Passed', color: passColor };
        case 'review':
            return { label: 'Review', color: reviewColor };
        case 'failed':
            return { label: 'Failed', color: failColor };
        default:
            return { label: 'Pending', color: '#666' }; 
    }
};

const getOverallVerdict = (results) => {
    if (!results || results.length === 0) return { score: 0, status: 'Review' };
    
    let passedCount = results.filter(r => r.status === 'success').length;
    let totalChecks = results.length;
    
    const score = totalChecks > 0 ? Math.round((passedCount / totalChecks) * 100) : 0;
    
    let status;
    if (results.some(r => r.status === 'failed')) {
        status = 'Failed';
    } else if (results.some(r => r.status === 'review')) {
        status = 'Review';
    } else if (results.every(r => r.status === 'success')) {
        status = 'Verified';
    } else {
        status = 'Review';
    }

    return { score, status };
};

const getSvgIcon = (step, color) => {
    const strokeColor = color || primaryColor; 

    if (step.includes('OCR') || step.includes('Data')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" 
                strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
        );
    } 
    if (step.includes('Tamper')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" 
                strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M12 2l7 4v5c0 5-3 9-7 11-4-2-7-6-7-11V6z"></path>
            </svg>
        );
    } 
    if (step.includes('Face') || step.includes('Liveness')) {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" 
                strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M20 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M4 21v-2a4 4 0 0 1 3-3.87"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="2" 
            strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            <path d="M9 12l2 2 4-4"></path>
        </svg>
    );
};

// --- MAIN RESULT COMPONENT ---
export const Result = ({ idType, results, onBackToUpload }) => {
    // State to track which detail box is open
    const [openDetailIndex, setOpenDetailIndex] = useState(null);

    const { score, status } = getOverallVerdict(results);
    const circleColor = status === 'Verified' ? passColor : status === 'Review' ? reviewColor : failColor;
    const badgeColor = status === 'Verified' ? passColor : status === 'Review' ? reviewColor : failColor;

    const toggleDetails = (index) => {
        setOpenDetailIndex(openDetailIndex === index ? null : index);
    };

    return (
        <div style={styles.body}>
            <header style={styles.header}>
                <h1 style={styles.headerH1}>Secure KYC – Verification Results</h1>
                <a href="#" style={{...styles.step, textDecoration: 'none', cursor: 'pointer', color: primaryColor, fontWeight: '600'}} onClick={onBackToUpload}>
                    Start New Verification
                </a>
            </header>

            <div style={styles.container}>
                {/* Score Box */}
                <div style={styles.scoreBox}>
                    <div style={styles.scoreCircle(circleColor)}>{score}%</div>
                    <p style={styles.scoreBoxP}>{idType} verification completed</p>
                    <div style={styles.verifiedBadge(badgeColor)}>{status}</div>
                </div>

                {/* Summary Box */}
                <div style={styles.summaryBox}>
                    <h2 style={styles.summaryBoxH2}>Verification Summary</h2>
                    <div style={styles.summaryRow}>
                        {results.map((r, index) => {
                            const { label, color } = getStatusInfo(r.status);
                            const showDetails = openDetailIndex === index;
                            
                            // Format the message for display in the details box
                            const detailContent = 
                                r.step.includes('Extraction') || r.step.includes('OCR')
                                    ? r.message // Assume message contains extracted data/JSON for OCR
                                    : r.message;

                            return (
                                <div key={index} style={styles.checkCard}>
                                    <div style={styles.checkHeader}>
                                        <div style={styles.checkTitle}>
                                            {getSvgIcon(r.step, color)}
                                            <h3 style={styles.checkTitleH3}>{r.step}</h3>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <span style={styles.status(color)}>{label}</span>
                                            {r.message && (
                                                <button 
                                                    style={styles.detailsButton} 
                                                    onClick={() => toggleDetails(index)}
                                                >
                                                    {showDetails ? 'Hide Details' : 'View Details'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {showDetails && (
                                        <div style={styles.detailsBox}>
                                            {detailContent}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <footer style={styles.footer}>
                &copy; 2025 Secure KYC. All rights reserved.
            </footer>
        </div>
    );
};

export default Result;
