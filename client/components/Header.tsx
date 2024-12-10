import React from 'react';
import Image from 'next/image';  // Import Image from next/image
import styles from '../styles/Header.module.css';
import Link from 'next/link';  // Import Link from next/link

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
          <li><Link href="/">Home</Link></li>  {/* Link to Home page */}
          <li><Link href="/event/EventList">Events</Link></li>  {/* Link to Events page */}
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
