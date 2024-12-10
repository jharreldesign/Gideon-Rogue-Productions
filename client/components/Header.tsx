import React from 'react';
import Image from 'next/image';  // Import Image from next/image
import styles from '../styles/Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Image 
            src="/images/Logo.png" 
            alt="Logo" 
            width={150}   // Set width
            height={50}   // Set height
            className={styles.logoImage} 
          />
        </div>
        <ul className={styles.navLinks}>
          <li><a href="#">Home</a></li>
          <li><a href="#">Events</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
