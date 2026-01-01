
import React, { useState, useRef, useEffect } from 'react';
// Import the shared Result component
import Result from './Result'; 

// Utility function to convert DataURL to File object
const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const Pan = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const userId = queryParams.get("userId");
    // State management for different views and data
    const [view, setView] = useState('upload'); // 'upload', 'webcam', 'processing', 'results', 'live-match'
    const [selectedFile, setSelectedFile] = useState(null);
    const [verificationResults, setVerificationResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [error, setError] = useState(null);
    const [idFaceFilename, setIdFaceFilename] = useState(null);
    const [matchMessage, setMatchMessage] = useState("");
    const [matching, setMatching] = useState(false);
    
    // Webcam and photo capture states
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);

    const BACKEND_BASE = "http://localhost:5000";

    // Define all CSS rules as a single JavaScript object
    const styles = {
        body: {
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
            backgroundColor: '#f8f9fa',
            margin: 0,
            padding: '2rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            color: '#344054',
        },
        container: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            width: '100%',
            maxWidth: '1024px',
            boxSizing: 'border-box',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #eaecf0',
        },
        backLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: '#344054',
            fontWeight: '600',
        },
        headerTitle: {},
        headerTitleH1: {
            margin: 0,
            fontSize: '1.25rem',
            color: '#101828',
        },
        headerTitleP: {
            margin: '0.25rem 0 0',
            color: '#667085',
            fontSize: '0.875rem',
            paddingLeft:'10px',
        },
        stepIndicator: {
            display: 'flex',
            gap: '0.5rem',
        },
        stepIndicatorSpan: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#d0d5dd',
        },
        stepActive: {
            backgroundColor: '#1570ef',
        },
        stepFilled: {
            backgroundColor: '#1570ef',
            opacity: 0.5,
        },
        mainContent: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
        },
        instructionsSection: {},
        instructionsSectionH2: {
            fontSize: '1.125rem',
            color: '#101828',
            marginTop: 0,
        },
        instructionsSectionP: {
            color: '#667085',
            marginBottom: '2rem',
            fontSize: '0.9rem',
        },
        instructionList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        instructionListItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1.5rem',
        },
        instructionNumber: {
            flexShrink: 0,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#e0eaff',
            color: '#175cd3',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '0.875rem',
        },
        instructionText: {},
        instructionTextH3: {
            margin: 0,
            fontSize: '1rem',
            color: '#101828',
            fontWeight: 600,
        },
        instructionTextP: {
            margin: '0.25rem 0 0',
            color: '#667085',
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        tipsBox: {
            backgroundColor: '#f0f6fe',
            borderLeft: '4px solid #175cd3',
            padding: '1rem',
            borderRadius: '0 8px 8px 0',
            marginTop: '1.5rem',
        },
        tipsHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            color: '#101828',
        },
        tipsBoxUl: {
            listStylePosition: 'inside',
            paddingLeft: 0,
            margin: '0.75rem 0 0 0',
            color: '#667085',
            fontSize: '0.875rem',
        },
        tipsBoxLi: {
            paddingLeft: '0.5rem',
            marginBottom: '0.25rem',
        },
        uploadSection: {},
        uploadSectionH2: {
            fontSize: '1.125rem',
            color: '#101828',
            marginTop: 0,
        },
        uploadSectionP: {
            color: '#667085',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
        },
        dropZone: {
            border: '2px dashed #d0d5dd',
            borderRadius: '8px',
            padding: '2rem 1rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fafbfd',
            height: '220px',
        },
        dropZoneIcon: {
            width: '48px',
            height: '48px',
            backgroundColor: '#f2f4f7',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '1px solid #eaecf0',
            marginBottom: '1rem',
        },
        dropZoneP: {
            margin: '0.25rem 0',
        },
        uploadText: {
            color: '#1570ef',
            fontWeight: 600,
        },
        uploadTextSpan: {
            color: '#344054',
            fontWeight: 400,
        },
        infoText: {
            fontSize: '0.875rem',
            color: '#667085',
        },
        fileSpecs: {
            fontSize: '0.75rem',
            color: '#667085',
            marginTop: '0.5rem',
        },
        separator: {
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            color: '#98a2b3',
            margin: '1.5rem 0',
            fontSize: '0.875rem',
            paddingLeft:'220px',
        },
        cameraButton: {
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#344054',
            backgroundColor: '#ffffff',
            border: '1px solid #d0d5dd',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s',
        },
        submitButton: {
            backgroundColor: '#1570ef',
            color: '#fff',
            border: '1px solid #1570ef',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '8px',
            width: '100%',
            cursor: 'pointer',
            marginTop: '1.5rem',
            transition: 'background-color 0.2s',
        },
        submitButtonHover: {
            backgroundColor: '#125bb7',
        },
        // NEW STYLES for Processing view (Centralized and larger)
        processingContainer: {
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            maxWidth: '400px',
            width: '100%',
        },
        spinner: {
            border: '4px solid rgba(0, 0, 0, 0.1)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            borderLeftColor: '#1570ef',
            animation: 'spin 1s linear infinite', 
            margin: '2rem auto',
        },
        processingText: {
            fontSize: '1.2rem',
            color: '#667085',
            marginTop: '1rem',
        },
        '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
        },
        webcamContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
        },
        videoElement: {
            width: '100%',
            maxWidth: '400px',
            borderRadius: '8px',
            border: '1px solid #d0d5dd',
        },
        captureButton: {
            backgroundColor: '#1570ef',
            color: '#fff',
            border: '1px solid #1570ef',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            fontWeight: '600',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '0.5rem',
        },
        previewImage: {
            width: '100%',
            maxWidth: '400px',
            marginTop: '1rem',
            borderRadius: '8px',
        },
        success: { color: '#1570ef' },
        failed: { color: '#d92d20' },
    };

    // --- UTILITY/HOOKS ---

    // Utility function to stop the camera stream
    const stopStream = (currentStream) => {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }
    }

    const stopWebcam = () => {
        stopStream(streamRef.current);
        streamRef.current = null;
        setCapturedImage(null);
        setIsWebcamActive(false);
    };

    const stopMatchCamera = () => {
        stopStream(streamRef.current);
        streamRef.current = null;
        setIsWebcamActive(false); 
    };
    
    // Cleanup function runs on unmount
    useEffect(() => {
        return () => {
            stopWebcam();
            stopMatchCamera();
        };
    }, []);

    // Function to reset state and go back to upload (used by Result.jsx)
    const resetVerification = () => {
        setView('upload');
        setSelectedFile(null);
        setVerificationResults([]);
        setError(null);
        setIdFaceFilename(null);
        setMatchMessage("");
        setIsLoading(false);
        stopWebcam();
        stopMatchCamera();
    };

    // Helper to get step title and number
    const getStepInfo = (currentView) => {
        switch (currentView) {
            case 'upload': 
            case 'webcam': 
                return { title: 'Upload Document', step: 'Step 1 of 3' };
            case 'live-match': 
                return { title: 'Live Face Matching', step: 'Step 2 of 3' };
            case 'processing':
            case 'results': 
                return { title: 'Verification Results', step: 'Step 3 of 3' };
            default: return { title: 'PAN Verification', step: '' };
        }
    };
    
    const { title, step } = getStepInfo(view);


    // --- WEBCAM FUNCTIONALITY ---
    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsWebcamActive(true);
            setCapturedImage(null);
            setView('webcam');
            setError(null);
        } catch (err) {
            console.error('Error accessing webcam:', err);
            setError('Could not access your webcam. Please check your permissions.');
            setView('upload');
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageDataURL = canvas.toDataURL('image/jpeg');
            setCapturedImage(imageDataURL);
        }
    };

    const handleUseCapturedPhoto = () => {
        const file = dataURLtoFile(capturedImage, 'pan_webcam_capture.jpeg');
        setSelectedFile(file);
        stopWebcam(); // This will also return to 'upload' view via stopWebcam's internal logic
    };

    // --- UPLOAD & API FUNCTIONALITY ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setVerificationResults([]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setVerificationResults([]);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file first.');
            setView('upload'); // Keep on upload page if no file selected
            return;
        }
        setIsLoading(true);
        setView('processing');
        setError(null);
        setVerificationResults([]);
        setMatchMessage("");

        const formData = new FormData();
        formData.append('id_card_photo', selectedFile);
        formData.append('id_type', 'pan');
        formData.append("userId", userId);

        try {
            const response = await fetch(`${BACKEND_BASE}/verify-id-card`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Network response was not ok');
            }
            
            // Transform API results to match the Result component's structure
            const transformedResults = (data.results || []).map(r => {
                // Determine a detailed message for the View Details button
                let detailMessage = r.message || "No specific details provided.";
                
                if (r.step.includes("OCR Data")) {
                    detailMessage = `Extracted PAN Data: \n${JSON.stringify(data.extracted_data || {}, null, 2)}`;
                } else if (r.step.includes("Tamper")) {
                     detailMessage = `Tamper Score: ${data.tamper_score || 'N/A'}\nConfidence: ${r.message}`;
                }
                
                return {
                    step: r.step || "Unknown Check",
                    status: r.status || "review",
                    message: detailMessage, // Use the more detailed message here
                };
            });

            setVerificationResults(transformedResults);
            setIsLoading(false);

            // Determine next step: Live match if passed and face extracted, else results
            if (data.overall_status === 'passed' && data.id_face_filename) {
                setIdFaceFilename(data.id_face_filename);
                setView('live-match');
            } else {
                setView('results');
            }
        } catch (err) {
            console.error('API Error:', err);
            // On API failure, populate results with an explicit failed step
            setVerificationResults([{ 
                step: "API Connection Check", 
                status: "failed", 
                message: `The client could not connect to the backend service: ${err.message}` 
            }]);
            setError(`A critical error occurred: ${err.message}`);
            setIsLoading(false);
            setView('results');
        }
    };
    
    // --- LIVE MATCHING FUNCTIONS ---
    
    const startMatchCamera = async () => {
        setMatchMessage("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
            setIsWebcamActive(true); 
        } catch (err) {
            console.error("Camera start error:", err);
            setMatchMessage("❌ Unable to access camera. Please allow camera permissions.");
            setIsWebcamActive(false);
        }
    };

    const captureAndSend = async () => {
        setMatchMessage("");
        if (!videoRef.current || !idFaceFilename || !streamRef.current) {
            setMatchMessage("❌ Camera not started or session missing.");
            return;
        }
        if(matching) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
            if (!blob) return setMatchMessage("❌ Failed to capture image.");
            setMatching(true);
            setMatchMessage("Verifying face match...");

            const formData = new FormData();
            formData.append("live_photo", blob, "live.jpg");
            formData.append("id_face_filename", idFaceFilename);
            formData.append("userId", userId);
            let matchStatus;
            let matchMessageText;
            let apiData = {}; // Defined outside try block for scoping

            try {
                const res = await fetch(`${BACKEND_BASE}/match-face`, {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                apiData = data; // Assign data to the outer scoped variable
                
                if (res.ok && data.status === "success") {
                    matchMessageText = "✅ Face match successful — verification complete.";
                    matchStatus = "success";
                } else if (data.status === "failed") {
                    matchMessageText = "❌ Face match failed. Please try again.";
                    matchStatus = "failed";
                } else if (data.error) {
                    matchMessageText = "❌ Error: " + data.error;
                    matchStatus = "failed";
                } else {
                    matchMessageText = "❌ Unexpected response from server.";
                    matchStatus = "failed";
                }

                setMatchMessage(matchMessageText);

            } catch (err) {
                matchMessageText = `❌ Network error: ${err.message}`;
                matchStatus = "failed";
                setMatchMessage(matchMessageText);

            } finally {
                // Use the data from the API request via apiData
                const faceMatchResult = { 
                    step: "Live Face Match", 
                    status: matchStatus, 
                    message: `Face Match Score: ${apiData.match_score || 'N/A'}`
                };
                setVerificationResults(prev => [...prev, faceMatchResult]);

                stopMatchCamera();
                setMatching(false);
                setView('results'); 
            }
        }, "image/jpeg", 0.9);
    };

    // --- VIEW RENDERING LOGIC ---

    if (view === 'processing') {
        return (
            <div style={styles.body}>
                <div style={styles.processingContainer}>
                    <div style={styles.spinner}></div>
                    <p style={styles.processingText}>Processing document and extracting face...</p>
                </div>
            </div>
        );
    }
    
    if (view === 'results') {
        // RENDER THE NEW RESULT DASHBOARD COMPONENT
        return <Result 
                    idType="PAN" 
                    results={verificationResults} 
                    onBackToUpload={resetVerification}
                />;
    }

    if (view === 'webcam') {
        return (
            <div style={styles.body}>
                <div style={styles.container}>
                    <header style={styles.header}>
                        <a href="#" style={styles.backLink} onClick={stopWebcam}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.8333 10H4.16666" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9.99999 15.8334L4.16666 10.0001L9.99999 4.16675" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back
                        </a>
                        <div style={styles.headerTitle}>
                            <h1 style={styles.headerTitleH1}>Capture PAN Photo</h1>
                        </div>
                        <div></div>
                    </header>
                    <div style={styles.webcamContainer}>
                        {capturedImage ? (
                            <>
                                <img src={capturedImage} alt="Captured" style={styles.previewImage} />
                                <button style={{...styles.submitButton, marginTop: '1rem'}} onClick={handleUseCapturedPhoto}>
                                    Use this Photo
                                </button>
                                <button style={styles.cameraButton} onClick={() => setCapturedImage(null)}>
                                    Re-take
                                </button>
                            </>
                        ) : (
                            <>
                                <video ref={videoRef} autoPlay playsInline style={styles.videoElement}></video>
                                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                                <button style={styles.captureButton} onClick={handleCapture} disabled={!isWebcamActive}>
                                    Capture Photo
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'live-match') {
        const msgColor = matchMessage.startsWith('❌') ? styles.failed.color : styles.success.color;
        
        return (
            <div style={styles.body}>
                <div style={styles.container}>
                    <header style={styles.header}>
                        <a href="#" style={styles.backLink} onClick={() => {stopMatchCamera(); setView('upload');}}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.8333 10H4.16666" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9.99999 15.8334L4.16666 10.0001L9.99999 4.16675" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back
                        </a>
                        <div style={styles.headerTitle}>
                            <h1 style={styles.headerTitleH1}>Live Face Matching</h1>
                            <p style={styles.headerTitleP}>Step 2 of 3</p>
                        </div>
                        <div style={styles.stepIndicator}>
                            <span style={{ ...styles.stepIndicatorSpan, ...styles.stepFilled }}></span>
                            <span style={{ ...styles.stepIndicatorSpan, ...styles.stepActive }}></span>
                            <span style={styles.stepIndicatorSpan}></span>
                        </div>
                    </header>
                    <div style={styles.webcamContainer}>
                        <h2 style={{...styles.uploadSectionH2, marginBottom: '0.5rem'}}>Capture Your Face</h2>
                        <p style={{...styles.uploadSectionP, marginBottom: '1rem'}}>Align your face within the frame and click capture.</p>
                        <video ref={videoRef} autoPlay muted playsInline style={styles.videoElement} />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                            {!streamRef.current ? (
                                <button style={styles.submitButton} onClick={startMatchCamera}>
                                    Start Camera
                                </button>
                            ) : (
                                <button style={{...styles.submitButton, backgroundColor: styles.failed.color, border: `1px solid ${styles.failed.color}`}} onClick={stopMatchCamera}>
                                    Stop Camera
                                </button>
                            )}
                            <button
                                style={{...styles.submitButton, opacity: streamRef.current ? 1 : 0.5}}
                                onClick={captureAndSend}
                                disabled={!streamRef.current || matching}
                            >
                                {matching ? 'Verifying...' : 'Capture & Verify'}
                            </button>
                        </div>
                        {matchMessage && <div style={{marginTop: '1rem', textAlign: 'center', color: msgColor}}>{matchMessage}</div>}
                    </div>
                </div>
            </div>
        );
    }

    // Default Upload View
    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <header style={styles.header}>
                    <a href="/id" style={styles.backLink}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.8333 10H4.16666" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9.99999 15.8334L4.16666 10.0001L9.99999 4.16675" stroke="#344054" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </a>
                    <div style={styles.headerTitle}>
                        <h1 style={styles.headerTitleH1}>Upload Document</h1>
                        <p style={styles.headerTitleP}>Step 1 of 3</p>
                    </div>
                    <div style={styles.stepIndicator}>
                        <span style={{ ...styles.stepIndicatorSpan, ...styles.stepActive }}></span>
                        <span style={styles.stepIndicatorSpan}></span>
                        <span style={styles.stepIndicatorSpan}></span>
                    </div>
                </header>
                <main style={styles.mainContent}>
                    <section style={styles.instructionsSection}>
                        <h2 style={styles.instructionsSectionH2}>Upload Instructions</h2>
                        <p style={styles.instructionsSectionP}>Please follow these guidelines to ensure successful verification</p>
                        <ol style={styles.instructionList}>
                            <li style={styles.instructionListItem}>
                                <div style={styles.instructionNumber}>1</div>
                                <div style={styles.instructionText}>
                                    <h3 style={styles.instructionTextH3}>Provide ID proof clearly</h3>
                                    <p style={styles.instructionTextP}>Ensure your PAN card is clearly visible with all text readable</p>
                                </div>
                            </li>
                            <li style={styles.instructionListItem}>
                                <div style={styles.instructionNumber}>2</div>
                                <div style={styles.instructionText}>
                                    <h3 style={styles.instructionTextH3}>Make sure photo is visible</h3>
                                    <p style={styles.instructionTextP}>Your photograph on the ID should be clearly visible and not blurred</p>
                                </div>
                            </li>
                            <li style={styles.instructionListItem}>
                                <div style={styles.instructionNumber}>3</div>
                                <div style={styles.instructionText}>
                                    <h3 style={styles.instructionTextH3}>Good lighting</h3>
                                    <p style={styles.instructionTextP}>Take the photo in good lighting to avoid shadows and glare</p>
                                </div>
                            </li>
                        </ol>
                        <div style={styles.tipsBox}>
                            <div style={styles.tipsHeader}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6023 18.3333 9.99996C18.3333 5.39759 14.6024 1.66663 10 1.66663C5.39763 1.66663 1.66667 5.39759 1.66667 9.99996C1.66667 14.6023 5.39763 18.3333 10 18.3333Z" stroke="#175CD3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 6.66663V9.99996" stroke="#175CD3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10 13.3334H10.0083" stroke="#175CD3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Tips for best results</span>
                            </div>
                            <ul style={styles.tipsBoxUl}>
                                <li style={styles.tipsBoxLi}>Place the document on a flat, contrasting surface</li>
                                <li style={styles.tipsBoxLi}>Avoid reflections and shadows</li>
                                <li style={styles.tipsBoxLi}>Capture the entire document within the frame</li>
                                <li style={styles.tipsBoxLi}>Use landscape orientation for better results</li>
                            </ul>
                        </div>
                    </section>
                    <section style={styles.uploadSection}>
                        <h2 style={styles.uploadSectionH2}>Upload Your PAN Document</h2>
                        <p style={styles.uploadSectionP}>Choose from the options below to provide your ID document</p>
                        <label htmlFor="file-upload">
                            <div
                                style={styles.dropZone}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <div style={styles.dropZoneIcon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 16.5V4.5" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M16.5 9L12 4.5L7.5 9" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M21.1667 12.6667V18.3333C21.1667 18.7936 20.9821 19.2355 20.6696 19.548C20.357 19.8606 19.9152 20.0452 19.455 20.0452H4.87833C4.41811 20.0452 3.97629 19.8606 3.66373 19.548C3.35117 19.2355 3.16667 18.7936 3.16667 18.3333V12.6667" stroke="#475467" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <p style={styles.dropZoneP}>
                                    <span style={styles.uploadText}>
                                        {selectedFile ? selectedFile.name : 'Click to upload'}
                                    </span>
                                    <span style={styles.uploadTextSpan}> or drag and drop</span>
                                </p>
                                <p style={{ ...styles.dropZoneP, ...styles.infoText }}>Upload clear image of your PAN card</p>
                                <p style={{ ...styles.dropZoneP, ...styles.fileSpecs }}>We accept JPG/PNG, max 5MB</p>
                            </div>
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <div style={styles.separator}>or</div>
                        <button style={styles.cameraButton} onClick={startWebcam}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 7.5L5.73333 4.16667H9.275C9.45823 4.16667 9.63354 4.2369 9.76131 4.36468C9.88909 4.49245 9.95933 4.66776 9.95933 4.851V5.51767C9.95933 5.7009 10.0296 5.87621 10.1573 6.00398C10.2851 6.13176 10.4604 6.202 10.6437 6.202H14.1667V7.5M2.5 7.5V15.8333C2.5 16.2754 2.6756 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H15.8333C16.2754 17.5 16.6993 17.3244 17.0118 17.0118C17.3244 16.6993 17.5 16.2754 17.5 15.8333V7.5M2.5 7.5H17.5M12.5 11.6667C12.5 12.3783 12.219 13.0605 11.719 13.5605C11.2189 14.0606 10.5368 14.3417 9.825 14.3417C9.11322 14.3417 8.43111 14.0606 7.93109 13.5605C7.43107 13.0605 7.15 12.3783 7.15 11.6667C7.15 10.9551 7.43107 10.2729 7.93109 9.7729C8.43111 9.27288 9.11322 8.99176 9.825 8.99176C10.5368 8.99176 11.2189 9.27288 11.719 9.7729C12.219 10.2729 12.5 10.9551 12.5 11.6667Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Take Photo with Camera
                        </button>
                        <button
                            style={{
                                ...styles.submitButton,
                                ...(isHovering && styles.submitButtonHover),
                                opacity: selectedFile ? 1 : 0.5,
                                cursor: selectedFile ? 'pointer' : 'not-allowed',
                            }}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            onClick={handleSubmit}
                            disabled={!selectedFile}
                        >
                            Submit Document
                        </button>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Pan;