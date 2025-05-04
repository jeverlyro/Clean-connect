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

  const resetInitialization = async () => {
    setStatus("resetting");
    setError(null);

    try {
      const response = await fetch("/api/whatsapp/initialize", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setStatus("idle");
        setQrAvailable(false);
      } else {
        setStatus("error");
        setError(data.error || "Failed to reset WhatsApp client");
      }
    } catch (err) {
      setStatus("error");
      setError(err.message || "An error occurred while resetting WhatsApp");
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
      <h1>Admin Notification Setup</h1>

      <div className={styles.card}>
        <h2>WhatsApp Notification System</h2>
        <p>
          This page allows you to set up WhatsApp notifications for admin
          alerts. When important events occur (like new water quality reports),
          notifications will be sent to the admin phone number configured in
          your environment variables.
        </p>
        <p>
          Current status: <span className={styles[status]}>{status}</span>
        </p>

        {error && (
          <div className={styles.error}>
            <p>Error: {error}</p>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            onClick={initializeWhatsApp}
            disabled={status === "initializing" || status === "resetting"}
            className={styles.button}
          >
            {status === "initializing"
              ? "Initializing..."
              : "Connect WhatsApp Notification Service"}
          </button>

          <button
            onClick={resetInitialization}
            disabled={
              status === "initializing" ||
              status === "resetting" ||
              status === "idle"
            }
            className={`${styles.button} ${styles.resetButton}`}
          >
            {status === "resetting" ? "Resetting..." : "Reset Connection"}
          </button>
        </div>

        <div className={styles.qrSection}>
          <h3>QR Code for Authentication</h3>

          {qrAvailable ? (
            <div className={styles.qrContainer}>
              <p>
                Scan this QR code with WhatsApp on your admin phone to connect
                the notification service:
              </p>
              <Image
                src={`/whatsapp-qr.png?t=${qrTimestamp}`}
                alt="WhatsApp QR Code"
                width={300}
                height={300}
                className={styles.qrCode}
              />
              <p className={styles.note}>
                Once authenticated, this QR code will disappear and the admin
                notifications will be active.
              </p>
            </div>
          ) : (
            <div className={styles.noQrContainer}>
              <p>No QR code available. This means either:</p>
              <ul className={styles.reasonsList}>
                <li>The WhatsApp notification service is already connected</li>
                <li>The service has not been initialized yet</li>
                <li>There was an error generating the QR code</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <h2>Admin Notification Setup Instructions</h2>
        <ol className={styles.instructionsList}>
          <li>
            Make sure your ADMIN_PHONE_NUMBER is correctly set in your
            environment variables
          </li>
          <li>
            Click the &quot;Connect WhatsApp Notification Service&quot; button
            above
          </li>
          <li>Wait for the QR code to appear (may take a few seconds)</li>
          <li>Open WhatsApp on your admin phone</li>
          <li>Tap Menu or Settings and select WhatsApp Web/Linked Devices</li>
          <li>Point your phone to this screen to scan the QR code</li>
          <li>The QR code will disappear once successfully connected</li>
        </ol>
        <p className={styles.note}>
          Note: Once connected, the WhatsApp notification service will
          automatically send alerts to the admin phone number when new reports
          are submitted or other important events occur.
        </p>
        <p className={styles.note}>
          Your admin phone number is configured in your environment variables.
          If you need to change it, update the ADMIN_PHONE_NUMBER environment
          variable.
        </p>
      </div>
    </div>
  );
}
