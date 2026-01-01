import { useLocation } from "react-router-dom";
import {
    HiOutlineCheckCircle,
    HiOutlineInformationCircle,
    HiOutlineShieldCheck,
    HiOutlineFingerPrint
} from "react-icons/hi";

export default function NewCustomerPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const token = params.get("token");
    const userId = params.get("userId");

    const verificationLink = `/id/?token=${token}&userId=${userId}`;

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f8f9fa",
                padding: "2rem",
                fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                color: "#344054",
            }}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    padding: "2.5rem",
                    width: "100%",
                    maxWidth: "720px",
                    border: "1px solid #eaecf0",
                }}
            >
                {/* Status Badge */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#f2f4f7",
                            color: "#344054",
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "6px 14px",
                            borderRadius: "999px",
                            border: "1px solid #eaecf0",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                backgroundColor: "#344054",
                            }}
                        ></span>
                        Secure Session Active
                    </div>
                </div>

                {/* Header */}
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "2rem",
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#101828",
                            width: "56px",
                            height: "56px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1rem",
                        }}
                    >
                        <HiOutlineFingerPrint size={28} color="#ffffff" />
                    </div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "1.75rem",
                            fontWeight: 800,
                            color: "#101828",
                        }}
                    >
                        Welcome to SecureKYC
                    </h1>
                </div>

                {/* Content */}
                <div
                    style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #eaecf0",
                        borderRadius: "8px",
                        padding: "1.5rem",
                        marginBottom: "2rem",
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                            color: "#475467",
                        }}
                    >
                        Your identity verification session is ready. Click the
                        button below to begin your KYC process using{" "}
                        <strong style={{ color: "#101828" }}>
                            Aadhaar or PAN
                        </strong>
                        .
                    </p>
                </div>

                {/* CTA */}
                <a
                    href={verificationLink}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        backgroundColor: "#1570ef",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontWeight: 600,
                        padding: "14px",
                        borderRadius: "8px",
                        fontSize: "1rem",
                        boxShadow: "0 1px 2px rgba(16,24,40,0.1)",
                        marginBottom: "1.5rem",
                    }}
                >
                    Start Verification
                    <HiOutlineCheckCircle size={20} />
                </a>

                {/* Info */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                        backgroundColor: "#ffffff",
                        border: "1px solid #eaecf0",
                        borderRadius: "8px",
                        padding: "1rem",
                        color: "#667085",
                        fontSize: "0.85rem",
                    }}
                >
                    <HiOutlineInformationCircle size={20} />
                    <p style={{ margin: 0, lineHeight: 1.5 }}>
                        Ensure your original documents are ready. This process
                        uses AI-powered face verification and usually completes
                        within 2 minutes.
                    </p>
                </div>

                {/* Footer */}
                <div
                    style={{
                        marginTop: "2rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid #eaecf0",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "6px",
                            color: "#98a2b3",
                            fontSize: "10px",
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                        }}
                    >
                        <HiOutlineShieldCheck size={14} />
                        Bank-Grade Security
                    </div>
                    <p
                        style={{
                            marginTop: "6px",
                            fontSize: "9px",
                            color: "#98a2b3",
                            letterSpacing: "0.12em",
                        }}
                    >
                        SecureKYC © 2025 • End-to-End Encrypted
                    </p>
                </div>
            </div>
        </div>
    );
}
