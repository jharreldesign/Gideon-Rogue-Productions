import { useEffect, useState } from 'react';
import Link from 'next/link';

import Header from '../../components/Header';

interface Venue {
  id: number;
  venuename: string;
  location: string;
  capacity: number;
  venuemanager: string;
}

const VenueList: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

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
          setIsAdmin(data.is_superuser || false);

          if (data.is_superuser) {
            fetchVenues(token);
          } else {
            setError('You do not have permission to view this page.');
          }
        }
      })
      .catch((err: Error) =>
        setError(`Error fetching user details: ${err.message}`)
      );
  }, []);

  const fetchVenues = (token: string) => {
    fetch('http://127.0.0.1:5000/venues', {
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
          setVenues(data.venues);
        }
      })
      .catch((err: Error) =>
        setError(`Error fetching venues: ${err.message}`)
      );
  };

  return (
    <div className="venue-list-container" style={styles.container}>
      <Header />
      <h1 style={styles.title}>Venue List</h1>
      {error && <p style={styles.error}>{error}</p>}
      {username && <p style={styles.welcome}>Welcome, {username}!</p>}

      {isAdmin ? (
        <div>
          {venues.length > 0 ? (
            <ul style={styles.venueList}>
              {venues.map((venue) => {
                return (
                  <li key={venue.id} style={styles.venueItem}>
                    <h2>{venue.venuename}</h2>
                    <h4>{venue.location}</h4>
                    <p>
                      <strong>Capacity:</strong> {venue.capacity}
                    </p>
                    <p>
                      <strong>Venue Manager:</strong> {venue.venuemanager}
                    </p>
                    <Link href={`/venues/${venue.id}`} passHref>
                      <button style={styles.viewDetailsButton}>View Details</button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p style={styles.noVenues}>No venues found.</p>
          )}
        </div>
      ) : (
        <p style={styles.noPermission}>You do not have permission to view this page.</p>
      )}
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
  welcome: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#4CAF50',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  venueList: {
    listStyleType: 'none',
    padding: 0,
  },
  venueItem: {
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
  noVenues: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#333',
  },
  noPermission: {
    color: 'red',
    textAlign: 'center',
  },
};

export default VenueList;
