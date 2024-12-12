import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import EventList from '../components/EventList';
import Footer from "../components/Footer";
import styles from "../styles/Index.module.css";
import Image from "next/image";

interface Show {
  id: number;
  bandsplaying: string;
  showdescription: string;
  showdate: string;
}

const Index = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingShows = (token: string) => {
    fetch("http://127.0.0.1:5000/shows", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          console.log("Fetched shows data:", data);
          setShows(data.shows);
        }
      })
      .catch((err: Error) => setError(`Error fetching shows: ${err.message}`));
  };

  useEffect(() => {
    // Get the token dynamically (e.g., from localStorage or global state)
    const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
    if (token) {
      fetchUpcomingShows(token);
    } else {
      setError("No authentication token found.");
    }
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <div className={styles.pageContainer}>
      <Hero className={styles.heroSection} />

      {/* Tour Posters Section */}
      <section className={styles.tourPosters}>
        <h2>Upcoming Tours</h2>
        <div className={styles.posterGallery}>
          <div className={styles.poster}>
            <Image
              src="https://www.masqueradeatlanta.com/wp-content/uploads/2024/11/121024_blackflag_ForSLIDER-360x555.jpg"
              alt="Tour Poster 1"
              width={360}
              height={555}
            />
          </div>
          <div className={styles.poster}>
            <Image
              src="https://www.masqueradeatlanta.com/wp-content/uploads/2024/12/122124_thetaylorparty_ForSlider-360x555.jpg"
              alt="Tour Poster 2"
              width={360}
              height={555}
            />
          </div>
          <div className={styles.poster}>
            <Image
              src="https://www.prestoimages.net/store30/rd227/227_pd3808693_1.jpg"
              alt="Tour Poster 3"
              width={360}
              height={555}
            />
          </div>
        </div>
      </section>
      
      <section>
        {/* Optionally pass the fetched shows to the EventList component */}
        <EventList shows={shows} />
      </section>

      {error && <p className={styles.error}>{error}</p>} {/* Display error message */}

      <Footer />
    </div>
  );
};

export default Index;
