import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useUser } from "../context/UserContex"; 
import styles from "../styles/Header.module.css";
import Link from "next/link";

const Header: React.FC = () => {
  const { user, setUser, loading, fetchUser } = useUser();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

  // Fetch user data only once when the component mounts (if not already loaded)
  useEffect(() => {
    if (!user && !loading) {
      fetchUser(); // Fetch the user data on initial load
    }
  }, [user, loading, fetchUser]);

  // Log user type (superuser or regular user) for debugging (only in development)
  useEffect(() => {
    if (user && process.env.NODE_ENV === "development") {
      if (user.role === "admin") {
        console.log("User is a superuser (admin):", user.username);
      } else {
        console.log("User is a regular user:", user.username);
      }
    }
  }, [user]);

  // Return loading state while fetching user data
  if (loading) return <p>Loading...</p>;

  // Handle logout functionality
  const handleLogout = () => {
    setUser(null); 
    localStorage.removeItem("token"); 
    router.push("/login"); 
  };

  // Toggle the dropdown menu visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

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
          {/* Regular navigation links */}
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/event/EventList">Events</Link>
          </li>
          <li>
            <Link href="/venue/VenueList">Venues</Link>
          </li>
          <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
          {/* Conditional rendering for Admin users */}
          {user?.role === "admin" && (
            <>

            <li className={styles.dropdown}>
              <button onClick={toggleDropdown} className={styles.dropdownButton}>
                Admin Options
              </button>
              {isDropdownOpen && (
                <ul className={styles.dropdownMenu}>
                  <li>
                    <Link href="/shows/ShowCreate">Schedule A Show</Link>
                  </li>
                  <li>
                    <Link href="/venue/VenueCreate">Create A Venue</Link>
                  </li>
                  <li>
                    <Link href="/bands/BandList">Bands</Link>
                  </li>
                  <li>
                    <Link href="/signup/index.tsx">Create A Staff Member</Link>
                  </li>
                </ul>
              )}
            </li>
            </>
          )}

          {/* Conditional rendering for non-logged in users */}
          {!user ? (
            <>
              <li>
                <Link href="/signup">Sign Up</Link>
              </li>
              <li>
                <Link href="/login">Login</Link>
              </li>
            </>
          ) : (
            <li>
              <a href="#" onClick={handleLogout}>
                Logout
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
