import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useUser } from "../context/UserContex"; // Ensure this is the correct path
import styles from "../styles/Header.module.css";
import Link from "next/link";

const Header: React.FC = () => {
  const { user, setUser, loading, fetchUser } = useUser();
  const router = useRouter();

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
  }, [user]); // Re-run when user changes

  // Return loading state while fetching user data
  if (loading) return <p>Loading...</p>;

  // Handle logout functionality
  const handleLogout = () => {
    setUser(null); // Clear user data
    localStorage.removeItem("token"); // Remove token from localStorage
    router.push("/login"); // Redirect to login page
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
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/event/EventList">Events</Link>
          </li>
          <li>
            <Link href="/venue/VenueList">Venues</Link>
          </li>
          {user?.role === "admin" && (
            <>
              <li>
                <Link href="/shows/ShowCreate">Schedule A Show</Link>
              </li>
              <li>
                <Link href="/venue/VenueCreate">Create A Venue</Link>
              </li>
            </>
          )}

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



// import React, { useEffect } from "react";
// import Image from "next/image";
// import { useRouter } from "next/router";
// import { useUser } from "../context/UserContex"; // Ensure this is the correct path
// import styles from "../styles/Header.module.css";
// import Link from "next/link";

// const Header: React.FC = () => {
//   const { user, setUser, loading, fetchUser } = useUser();
//   const router = useRouter();

//   // Fetch user data only once when the component mounts (if not already loaded)
//   useEffect(() => {
//     if (!user && !loading) {
//       fetchUser(); // Fetch the user data on initial load
//     }
//   }, [user, loading, fetchUser]);

//   // Log user type (superuser or regular user) for debugging (only in development)
//   useEffect(() => {
//     if (user && process.env.NODE_ENV === "development") {
//       if (user.admin) {
//         console.log("User is a superuser (admin):", user.username);
//       } else {
//         console.log("User is a regular user:", user.username);
//       }
//     }
//   }, [user]); // Re-run when user changes

//   // Return loading state while fetching user data
//   if (loading) return <p>Loading...</p>;

//   // Handle logout functionality
//   const handleLogout = () => {
//     setUser(null); // Clear user data
//     localStorage.removeItem("token"); // Remove token from localStorage
//     router.push("/login"); // Redirect to login page
//   };

//   return (
//     <header className={styles.header}>
//       <nav className={styles.navbar}>
//         <div className={styles.logo}>
//           <Link href="/">
//             <Image
//               src="/images/Logo.png"
//               alt="Logo"
//               width={150}
//               height={50}
//               className={styles.logoImage}
//             />
//           </Link>
//         </div>
//         <ul className={styles.navLinks}>
//           <li>
//             <Link href="/">Home</Link>
//           </li>
//           <li>
//             <Link href="/event/EventList">Events</Link>
//           </li>
//           <li>
//           <Link href="/venue/VenueList">Venues</Link>
//           </li>
//           {user?.role === "admin" && (
//             <>
//               <li>
//                 <Link href="/shows/ShowCreate">Schedule A Show</Link>
//               </li>
//               <li>
//                 <Link href="/venue/VenueCreate">Create A Venue</Link>
//               </li>
//             </>
//           )}

//           {!user ? (
//             <>
//               <li>
//                 <Link href="/signup">Sign Up</Link>
//               </li>
//               <li>
//                 <Link href="/login">Login</Link>
//               </li>
//             </>
//           ) : (
//             <li>
//               <a href="#" onClick={handleLogout}>
//                 Logout
//               </a>
//             </li>
//           )}
//         </ul>
//       </nav>
//     </header>
//   );
// };

// export default Header;
