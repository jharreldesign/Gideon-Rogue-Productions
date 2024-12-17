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
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchUpcomingShows = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shows`, {
      method: "GET",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
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

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % shows.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? shows.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Hero className={styles.heroSection} />

      {/* Carousel for Tour Posters */}
      <div className="carousel-container">
        <button onClick={prevSlide} className="carousel-arrow prev-arrow">
          &lt;
        </button>
        <div className="carousel-slides">
          {shows.slice(currentIndex, currentIndex + 3).map((show) => (
            <div key={show.id} className="carousel-slide">
              <Link
                href={show.tourUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={show.tourposter}
                  alt={`Tour poster for ${show.bandsplaying.join(", ")}`}
                  className="tour-poster"
                />
              </Link>
            </div>
          ))}
        </div>
        <button onClick={nextSlide} className="carousel-arrow next-arrow">
          &gt;
        </button>
      </div>

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
