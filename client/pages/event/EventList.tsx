import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../../styles/EventList.module.css";

interface Show {
  id: number;
  showdate: string;
  showdescription: string;
  showtime: string;
  location: string;
  bandsplaying: string[];
  ticketprice: number;
  tourposter: string;
}

interface EventListProps {
  shows: Show[];  // Shows will be passed in as a prop
  error: string | null; // Error message from the API or server
}

const EventList: React.FC<EventListProps> = ({ shows = [], error = null }) => {
  const [localShows, setLocalShows] = useState<Show[]>(shows);
  const [localError, setLocalError] = useState<string | null>(error);

  // Fetch the shows only if the prop 'shows' is empty
  useEffect(() => {
    if (shows.length === 0) {
      fetchShows();
    } else {
      setLocalShows(shows);  // Use the passed-in shows if available
    }
  }, [shows]); // Only re-run the effect if 'shows' prop changes

  const fetchShows = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/shows");
      const data = await response.json();
      if (data.error) {
        setLocalError(data.error);
      } else {
        setLocalShows(data.shows);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(`Error fetching shows: ${err.message}`);
      } else {
        setLocalError("An unknown error occurred.");
      }
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Event List</h1>
      {localError && <p className={styles.error}>{localError}</p>}
      <div>
        {localShows.length > 0 ? (
          <ul className={styles.showList}>
            {localShows.map((show) => (
              <li key={show.id} className={styles.showItem}>
                <div className={styles.showImageContainer}>
                  {/* Check if tourposter exists and provide a fallback */}
                  <Image
                    src={show.tourposter || "/default-poster.jpg"} // Use a default image if no tourposter is available
                    alt={`${show.bandsplaying.join(", ")} Tour Poster`}
                    className={styles.showImage}
                    width={200}
                    height={200}
                    layout="intrinsic"
                  />
                </div>
                <div className={styles.showInfo}>
                  <h2>{show.bandsplaying.join(", ")}</h2>
                  <h4>{show.showdescription}</h4>
                  <p>
                    <strong>Date:</strong> {new Date(show.showdate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {show.showtime}
                  </p>
                  <p>
                    <strong>Location:</strong> {show.location}
                  </p>
                  <Link href={`/shows/${show.id}`} passHref>
                    <button className={styles.viewDetailsButton}>View Details</button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noShows}>No events found.</p>
        )}
      </div>
    </div>
  );
};

export default EventList;
