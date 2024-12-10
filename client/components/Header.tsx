import React from 'react';
import Image from 'next/image';  // Import Image from next/image
import styles from '../styles/Header.module.css';
import Link from 'next/link';  // Import Link from next/link

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <Link href="/">
            <Image 
              src="/images/Logo.png" 
              alt="Logo" 
              width={150} 
              height={50}
              className={styles.logoImage} 
            />
          </Link>
        </div>
        <ul className={styles.navLinks}>
          <li><Link href="/">Home</Link></li>  
          <li><Link href="/event/EventList">Events</Link></li>
          <li><Link href="/shows/ShowCreate">Schedule A Show</Link></li>
          <li><Link href="/venue/VenueList">View Venues</Link></li>
          <li><Link href="/venue/VenueCreate">Create Venues</Link></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
