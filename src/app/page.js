"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useState } from "react";
// Import FontAwesome icons from react-icons
import { FaComments, FaVial, FaClipboardList, FaHistory } from "react-icons/fa";

export default function Home() {
  const [activeIcon, setActiveIcon] = useState(null);

  const handleIconHover = (index) => {
    setActiveIcon(index);
  };

  const handleIconLeave = () => {
    setActiveIcon(null);
  };

  const navItems = [
    {
      icon: FaComments,
      label: "Chatbot",
      href: "/chatbot",
      description: "Ask questions about water quality",
    },
    {
      icon: FaVial,
      label: "Analysis",
      href: "/image-analysis",
      description: "Upload and analyze water samples",
    },
    {
      icon: FaClipboardList,
      label: "Report",
      href: "/report",
      description: "Submit water quality issues",
    },
    {
      icon: FaHistory,
      label: "History",
      href: "/history",
      description: "View your past activity",
    },
  ];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>CleanConnect</h1>
          <p className={styles.description}>
            Your comprehensive solution for water quality analysis and
            management
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.heroSection}>
            <Image
              src="/hero-water.svg"
              alt="Clean water illustration"
              width={400}
              height={300}
              priority
              className={styles.heroImage}
            />
            <div className={styles.heroText}>
              <h2>Clean Water for a Better Future</h2>
              <p>
                Monitor, analyze, and improve water quality with our
                comprehensive suite of tools. From instant AI analysis to expert
                recommendations, CleanConnect helps you ensure water safety.
              </p>
            </div>
          </div>

          {activeIcon !== null && (
            <div className={styles.featurePreview}>
              <h3>{navItems[activeIcon].label}</h3>
              <p>{navItems[activeIcon].description}</p>
              <Link
                href={navItems[activeIcon].href}
                className={styles.previewLink}
              >
                Open {navItems[activeIcon].label} →
              </Link>
            </div>
          )}
        </div>
      </main>

      <nav className={styles.dockNav}>
        <div className={styles.dockContainer}>
          {navItems.map((item, index) => (
            <Link
              href={item.href}
              key={index}
              className={`${styles.dockItem} ${
                activeIcon === index ? styles.active : ""
              }`}
              onMouseEnter={() => handleIconHover(index)}
              onMouseLeave={handleIconLeave}
            >
              <div className={styles.dockIconWrapper}>
                <item.icon className={styles.dockIcon} size={40} />
              </div>
              <span className={styles.dockLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <footer className={styles.footer}>
        <p>© 2025 CleanConnect - Water Quality Solutions</p>
      </footer>
    </div>
  );
}
