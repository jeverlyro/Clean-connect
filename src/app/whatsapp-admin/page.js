"use client";

import { useState, useEffect } from "react";
import styles from "./whatsapp-admin.module.css";
import Image from "next/image";

export default function WhatsAppAdminPage() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [qrAvailable, setQrAvailable] = useState(false);
  const [qrTimestamp, setQrTimestamp] = useState(null);

  const initializeWhatsApp = async () => {
    setStatus("initializing");
    setError(null);

    try {
      const response = await fetch("/api/whatsapp/initialize", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setStatus("initialized");
        checkQrCode();
      } else {
        setStatus("error");
        setError(data.error || "Failed to initialize WhatsApp client");
      }
    } catch (err) {
      setStatus("error");
      setError(err.message || "An error occurred while initializing WhatsApp");
    }
  };

  const checkQrCode = async () => {
    try {
      // Add a cache-busting parameter to prevent browser caching
      const cacheBuster = new Date().getTime();
      const response = await fetch(`/whatsapp-qr.png?t=${cacheBuster}`, {
        method: "HEAD",
      });

      if (response.ok) {
        setQrAvailable(true);
        setQrTimestamp(new Date().getTime());
      } else {
        setQrAvailable(false);
      }
    } catch (err) {
      console.error("Error checking QR code:", err);
      setQrAvailable(false);
    }
  };

  useEffect(() => {
    // Check QR code status on component mount
    checkQrCode();

    // Set up interval to check QR code availability every 5 seconds
    const interval = setInterval(checkQrCode, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <h1>WhatsApp Integration Admin</h1>

      <div className={styles.card}>
        <h2>WhatsApp Client Status</h2>
        <p>
          Current status: <span className={styles[status]}>{status}</span>
        </p>

        {error && (
          <div className={styles.error}>
            <p>Error: {error}</p>
          </div>
        )}

        <button
          onClick={initializeWhatsApp}
          disabled={status === "initializing"}
          className={styles.button}
        >
          {status === "initializing"
            ? "Initializing..."
            : "Initialize WhatsApp Client"}
        </button>

        <div className={styles.qrSection}>
          <h3>QR Code for Authentication</h3>

          {qrAvailable ? (
            <div className={styles.qrContainer}>
              <p>
                Scan this QR code with WhatsApp on your phone to authenticate:
              </p>
              <Image
                src={`/whatsapp-qr.png?t=${qrTimestamp}`}
                alt="WhatsApp QR Code"
                width={300}
                height={300}
                className={styles.qrCode}
              />
              <p className={styles.note}>
                Once authenticated, this QR code will disappear.
              </p>
            </div>
          ) : (
            <p>
              No QR code available. This means either:
              <ul>
                <li>The WhatsApp client is already authenticated</li>
                <li>The WhatsApp client has not been initialized yet</li>
                <li>There was an error generating the QR code</li>
              </ul>
            </p>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <h2>Instructions</h2>
        <ol>
          <li>Click the "Initialize WhatsApp Client" button above</li>
          <li>Wait for the QR code to appear (may take a few seconds)</li>
          <li>Open WhatsApp on your phone</li>
          <li>Tap Menu or Settings and select WhatsApp Web</li>
          <li>Point your phone to this screen to scan the QR code</li>
          <li>The QR code will disappear once authentication is successful</li>
        </ol>
        <p className={styles.note}>
          Note: Once authenticated, the WhatsApp session will be saved and you
          won't need to scan the QR code again unless you log out from WhatsApp
          Web or the session expires.
        </p>
      </div>
    </div>
  );
}
