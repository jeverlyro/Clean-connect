"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  FaComments,
  FaVial,
  FaClipboardList,
  FaHistory,
  FaChartLine,
  FaWater,
  FaLeaf,
  FaShieldAlt,
} from "react-icons/fa";

export default function Home() {
  const heroRef = useRef(null);
  const benefitsRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.animate);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    if (benefitsRef.current) observer.observe(benefitsRef.current);
    if (statsRef.current) observer.observe(statsRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => {};
  }, []);

  const navItems = [
    {
      icon: FaComments,
      label: "Chatbot",
      href: "/chatbot",
    },
    {
      icon: FaVial,
      label: "Analysis",
      href: "/image-analysis",
    },
    {
      icon: FaClipboardList,
      label: "Report",
      href: "/report",
    },
    {
      icon: FaHistory,
      label: "History",
      href: "/history",
    },
  ];

  const benefitItems = [
    {
      icon: FaWater,
      title: "Real-time Monitoring",
      description:
        "Track water quality parameters in real-time with advanced sensors and AI analysis.",
    },
    {
      icon: FaChartLine,
      title: "Data-driven Insights",
      description:
        "Make informed decisions based on comprehensive water quality data and trend analysis.",
    },
    {
      icon: FaLeaf,
      title: "Environmental Impact",
      description:
        "Contribute to environmental conservation by identifying and addressing water contamination.",
    },
    {
      icon: FaShieldAlt,
      title: "Community Safety",
      description:
        "Ensure your community's health with proactive water safety monitoring and alerts.",
    },
  ];

  return (
    <div className={styles.page}>
      <nav className={`${styles.topNav} ${styles.fadeInDown}`}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.logoLink}>
            <span className={styles.logoText}>CleanConnect</span>
          </Link>
        </div>
        <div className={styles.navCenter}>
          {navItems.map((item, index) => (
            <Link href={item.href} key={index} className={styles.navItem}>
              <div className={styles.navIconWrapper}>
                <item.icon className={styles.navIcon} size={16} />
              </div>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </div>
        <div className={styles.navRight}>
          <Link href="/chatbot" className={styles.navButton}>
            Get Started
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={`${styles.header} ${styles.fadeInUp}`}>
          <h1 className={`${styles.title} ${styles.gradientAnimation}`}>
            CleanConnect
          </h1>
          <p className={styles.description}>
            Modern water quality monitoring and analysis for a healthier
            environment
          </p>
        </div>

        <div className={styles.content}>
          <div
            className={`${styles.heroSection} ${styles.slideInLeft}`}
            ref={heroRef}
          >
            <div className={styles.heroText}>
              <h2 className={styles.revealAnimation}>
                Clean Water for a Better Future
              </h2>
              <p
                className={styles.revealAnimation}
                style={{ animationDelay: "0.2s" }}
              >
                Monitor, analyze, and improve water quality with our suite of
                tools. From AI-powered analysis to actionable recommendations,
                CleanConnect helps you ensure water safety in your community.
              </p>
              <div
                className={`${styles.heroCta} ${styles.fadeInUp}`}
                style={{ animationDelay: "0.4s" }}
              >
                <Link
                  href="/chatbot"
                  className={`${styles.primaryButton} ${styles.pulseButton}`}
                >
                  Get Started
                </Link>
                <Link href="/report" className={styles.secondaryButton}>
                  Report an Issue
                </Link>
              </div>
            </div>
          </div>

          <div
            className={`${styles.benefitsSection} ${styles.fadeIn}`}
            ref={benefitsRef}
          >
            <h2 className={styles.sectionTitle}>Why Choose CleanConnect?</h2>
            <p className={styles.sectionDescription}>
              Our platform provides comprehensive tools to monitor, analyze, and
              improve water quality with cutting-edge technology.
            </p>

            <div className={styles.benefitsGrid}>
              {benefitItems.map((item, index) => (
                <div
                  key={index}
                  className={`${styles.benefitCard} ${styles.popIn}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div
                    className={`${styles.benefitIconWrapper} ${styles.rotateIn}`}
                    style={{ animationDelay: `${index * 0.15 + 0.2}s` }}
                  >
                    <item.icon className={styles.benefitIcon} size={28} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`${styles.statsSection} ${styles.slideInRight}`}
            ref={statsRef}
          >
            <div className={styles.statCard}>
              <span className={styles.statNumber}>95%</span>
              <span className={styles.statLabel}>Accuracy in Testing</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>150+</span>
              <span className={styles.statLabel}>Water Samples Analyzed</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>5+</span>
              <span className={styles.statLabel}>Pilot Communities</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>Beta</span>
              <span className={styles.statLabel}>Active Monitoring</span>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <h3>CleanConnect</h3>
            <p>Modern water quality monitoring for a healthier environment</p>
          </div>
          <div className={styles.footerColumn}>
            <h4>Features</h4>
            <Link href="/chatbot">Chatbot</Link>
            <Link href="/image-analysis">Analysis</Link>
            <Link href="/report">Report</Link>
          </div>
          <div className={styles.footerColumn}>
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2025 CleanConnect • Water Quality Solutions</p>
        </div>
      </footer>
    </div>
  );
}
