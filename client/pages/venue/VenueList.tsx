import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Venue {
  id: number;
  venuename: string;
  location: string;
  capacity: number;
  venuemanager: string;
}

const VenueList: React.FC = () => {
  const [isSuperUser, setIsSuperUser] = useState<boolean>(false); // Track superuser status
  const [error, setError] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Check if the token exists and fetch user info
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
            setIsSuperUser(data.isSuperUser); // Set the superuser status
          }
        })
        .catch((err: Error) =>
          setError(`Error fetching user details: ${err.message}`)
        );
    }

    // Fetch venues regardless of user role
    fetchVenues(token);
  }, []);

  const fetchVenues = (token: string | null) => {
    fetch('http://127.0.0.1:5000/venues', {
      method: 'GET',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
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
      <h1 style={styles.title}>Venue List</h1>
      {error && <p style={styles.error}>{error}</p>}

      {/* Render the "Create Venue" button only if the user is a superuser */}
      {isSuperUser && (
        <div style={styles.createButtonContainer}>
          <Link href="/venue/VenueCreate" passHref>
            <button style={styles.createVenueButton}>Create Venue</button>
          </Link>
        </div>
      )}

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
                  <Link href={`/venue/${venue.id}`} passHref>
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
  createButtonContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  createVenueButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};

export default VenueList;
