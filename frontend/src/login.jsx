import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
} from "react-icons/hi2";

const Gateway = () => {
  const [creds, setCreds] = useState({ user: "", pass: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /* ================= COLORS ================= */
  const styles = {
    brandDark: "#0F172A", // <-- THIS is your required color
    brandGradient: "linear-gradient(135deg, #020617 0%, #0F172A 100%)",
    buttonGradient: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    grayText: "#667085",
    errorRed: "#d92d20",
    glass: "rgba(255, 255, 255, 0.08)",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #E4E7EC",
    fontSize: "1rem",
    outline: "none",
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    // TEMP: Mock authentication
    setTimeout(() => {
      if (creds.user === "admin" && creds.pass === "admin@123") {
        navigate("/dashboard");
      } else {
        setError(
          "Invalid administrative credentials. Access attempt logged."
        );
        setIsLoading(false);
      }
    }, 800);
  };

  const isDisabled = !creds.user || !creds.pass || isLoading;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      {/* LEFT BRAND PANEL */}
      <div
        className="hidden lg:flex"
        style={{
          flex: "1.2",
          background: styles.brandGradient, // ✅ FIXED
          padding: "60px",
          color: "white",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <div style={{ zIndex: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "100px",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "8px",
                borderRadius: "10px",
              }}
            >
              <HiOutlineShieldCheck size={28} color={styles.brandDark} />
            </div>
            <span
              style={{
                fontSize: "1.4rem",
                fontWeight: "800",
              }}
            >
              SecureKYC
            </span>
          </div>

          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "800",
              lineHeight: "1.1",
              marginBottom: "24px",
            }}
          >
            The infrastructure <br /> for digital trust.
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              opacity: 0.85,
              maxWidth: "460px",
              lineHeight: "1.6",
            }}
          >
            Enterprise-grade identity verification. Securely process Aadhaar,
            PAN, and biometric data with AI-driven fraud detection.
          </p>
        </div>

        <div
          style={{
            zIndex: 10,
            display: "flex",
            gap: "24px",
            fontSize: "0.8rem",
            opacity: 0.7,
          }}
        >
          <span>ISO 27001 Certified</span>
          <span>GDPR Compliant</span>
          <span>Encryption at Rest</span>
        </div>

        {/* BACKGROUND SHAPES */}
        <div
          style={{
            position: "absolute",
            bottom: "-50px",
            left: "-50px",
            width: "400px",
            height: "400px",
            background: styles.glass,
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "5%",
            width: "150px",
            height: "150px",
            background: styles.glass,
            borderRadius: "24px",
            transform: "rotate(15deg)",
          }}
        />
      </div>

      {/* RIGHT LOGIN FORM */}
      <div
        style={{
          flex: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px",
        }}
      >
        <div style={{ maxWidth: "400px", width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2
              style={{
                fontSize: "1.85rem",
                fontWeight: "800",
                color: styles.brandDark, // ✅ FIXED
              }}
            >
              Internal Access
            </h2>
            <p style={{ color: styles.grayText }}>
              Enter administrative credentials to access the KYC dashboard.
            </p>
          </div>

          <form
            onSubmit={handleAdminLogin}
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Administrator ID
              </label>
              <input
                type="text"
                autoComplete="username"
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.border = `1px solid ${styles.brandDark}`)
                }
                onBlur={(e) =>
                  (e.target.style.border = "1px solid #E4E7EC")
                }
                onChange={(e) =>
                  setCreds({ ...creds, user: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.border = `1px solid ${styles.brandDark}`)
                }
                onBlur={(e) =>
                  (e.target.style.border = "1px solid #E4E7EC")
                }
                onChange={(e) =>
                  setCreds({ ...creds, pass: e.target.value })
                }
                required
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.6,
                  marginTop: "6px",
                  display: "inline-block",
                }}
              >
                Contact system administrator
              </span>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: "#FFF1F0",
                  border: "1px solid #FCA5A1",
                  padding: "12px",
                  borderRadius: "8px",
                  display: "flex",
                  gap: "10px",
                  color: styles.errorRed,
                }}
              >
                <HiOutlineExclamationTriangle size={20} />
                <span>{error}</span>
              </div>
            )}

            <button
              disabled={isDisabled}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                background: styles.buttonGradient, // ✅ FIXED
                color: "white",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Verifying..." : "Sign In to Console"}
              {!isLoading && <HiOutlineArrowRight />}
            </button>
          </form>

          <div
            style={{
              marginTop: "40px",
              textAlign: "center",
              padding: "20px",
              borderTop: "1px solid #F2F4F7",
              fontSize: "0.75rem",
              color: styles.grayText,
            }}
          >
            <HiOutlineLockClosed style={{ marginRight: "4px" }} />
            This system is protected by 256-bit encryption.
            <br />
            Unauthorised access attempts are monitored and automatically
            reported.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gateway;
