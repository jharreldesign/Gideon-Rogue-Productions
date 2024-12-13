import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import EventList from "../pages/event/EventList"; 
import Footer from "../components/Footer";
import styles from "../styles/Index.module.css";
import Image from "next/image";
import Link from "next/link";

interface Show {
  id: number;
  bandsplaying: string[];
  showdescription: string;
  showdate: string;
  showtime: string;
  location: string;
  ticketprice: number;
  tourposter: string;
  tourUrl: string;
}

const Index = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingShows = () => {
    fetch("http://127.0.0.1:5000/shows", {
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setShows(data.shows);
        }
      })
      .catch((err: Error) => setError(`Error fetching shows: ${err.message}`));
  };

  useEffect(() => {
    fetchUpcomingShows();
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Hero className={styles.heroSection} />
      <section className={styles.tourPosters}>
        <h2>Upcoming Tours</h2>
        <div className={styles.posterGallery}>
          {shows.slice(0, 6).map((show) => (
            <div key={show.id} className={styles.poster}>
              <Link href={`/shows/${show.id}`} passHref>

                <Image
                  src={show.tourposter}
                  alt={`Tour Poster for ${show.bandsplaying.join(", ")}`}
                  width={360}
                  height={555}
                  className={styles.posterLink}  
                />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <EventList shows={shows} error={error} />
      </section>

      {error && <p className={styles.error}>{error}</p>}

      <Footer />
    </div>
  );
};

export default Index;
