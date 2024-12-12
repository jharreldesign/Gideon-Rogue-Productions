import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/EventList.module.css';

interface Show {
  id: number;
  showdate: string;
  showdescription: string;
  showtime: string;
  location: string;
  bandsplaying: string[];
  ticketprice: number;
}

interface User {
  isLoggedIn: boolean;
  isSuperUser: boolean;
}

const EventList: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [user, setUser] = useState<User>({ isLoggedIn: false, isSuperUser: false });

  useEffect(() => {
    fetchShows();

    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://127.0.0.1:5000/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setUser({
              isLoggedIn: true,
              isSuperUser: data.isSuperUser,
            });
          }
        })
        .catch((err: Error) => setError(`Error fetching user details: ${err.message}`));
    }
  }, []);

  const fetchShows = () => {
    fetch('http://127.0.0.1:5000/shows', {
      method: 'GET',
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

  return (
    <div>
      {/* Conditional rendering based on user state */}
      <div className={styles.container}>
        <h1 className={styles.title}>Event List</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div>
          {shows.length > 0 ? (
            <ul className={styles.showList}>
              {shows.map((show) => (
                <li key={show.id} className={styles.showItem}>
                  <h2>{show.bandsplaying.join(', ')}</h2>
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
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noShows}>No events found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;
