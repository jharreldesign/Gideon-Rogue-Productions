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
  shows: Show[] | undefined;
  error: string | null;
}

const EventList: React.FC<EventListProps> = ({ shows = [], error }) => {
  const [localShows, setLocalShows] = useState<Show[]>(shows);
  const [localError, setLocalError] = useState<string | null>(error);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (shows.length === 0) {
      fetchShows();
    }
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); 
  }, [shows]);

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

  // Delete show function
  const deleteShow = async (showId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLocalError("You must be logged in to delete a show.");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/shows/${showId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete the show.");
      }

      // Remove the show from the list after deletion
      setLocalShows(localShows.filter((show) => show.id !== showId));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLocalError(`Error deleting show: ${err.message}`);
      } else {
        setLocalError("An unknown error occurred while deleting the show.");
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
                  <Image
                    src={show.tourposter}
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
                    <button className={`${styles.button} ${styles.viewDetailsButton}`}>
                      View Details
                    </button>
                  </Link>

                  <div className={styles.buttonContainer}>
                    {isLoggedIn && (
                      <>
                        <Link href={`/shows/edit/${show.id}`} passHref>
                          <button className={`${styles.button} ${styles.editButton}`}>
                            Edit Show
                          </button>
                        </Link>
                        <button
                          className={`${styles.button} ${styles.deleteButton}`}
                          onClick={() => deleteShow(show.id)}
                        >
                          Delete Show
                        </button>
                      </>
                    )}
                  </div>
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
