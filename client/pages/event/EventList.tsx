import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Show {
  id: number;
  showdate: string;
  showdescription: string;
  showtime: string;
  location: string;
  bandsplaying: string[];
  ticketprice: number;
}

const EventList: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSuperUser, setIsSuperUser] = useState<boolean>(false);

  useEffect(() => {
    // Fetch shows regardless of login status
    fetchShows();

    // Check login status and fetch user details if logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
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
            setUsername(data.username);
            setIsSuperUser(data.isSuperUser);
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
    <div className="event-list-container" style={styles.container}>
      {/* Pass user data as props */}
      <h1 style={styles.title}>Event List</h1>
      {error && <p style={styles.error}>{error}</p>}
      <div>
        {shows.length > 0 ? (
          <ul style={styles.showList}>
            {shows.map((show) => {
              return (
                <li key={show.id} style={styles.showItem}>
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
                    <button style={styles.viewDetailsButton}>View Details</button>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p style={styles.noShows}>No events found.</p>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    margin: '0 auto',
    padding: '20px',
    maxWidth: '1200px',
    backgroundColor: '#f9f9f9',
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    marginBottom: '20px',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  showList: {
    listStyleType: 'none',
    padding: 0,
  },
  showItem: {
    backgroundColor: '#fff',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  viewDetailsButton: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '10px 15px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    textAlign: 'center',
  },
  noShows: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#333',
  },
};

export default EventList;