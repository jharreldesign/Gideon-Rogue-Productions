import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Band {
  id: number;
  bandname: string;
  hometown: string;
  genre: string;
  yearstarted: number;
  membernames: string[];
}

const BandList: React.FC = () => {
  // const [username, setUsername] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bands, setBands] = useState<Band[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
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
          // setUsername(data.username);
          setIsAdmin(data.admin || true);

          if (data.role === "admin") {
            fetchBands(token);
          } else {
            setError('You do not have permission to view this page.');
          }
        }
      })
      .catch((err: Error) =>
        setError(`Error fetching user details: ${err.message}`)
      );
  }, []);

  const fetchBands = (token: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bands`, {
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
          setBands(data.bands);
        }
      })
      .catch((err: Error) =>
        setError(`Error fetching bands: ${err.message}`)
      );
  };

  return (
    <div className="band-list-container" style={styles.container}>
      <h1 style={styles.title}>Band List</h1>
      {error && <p style={styles.error}>{error}</p>}

      {isAdmin ? (
        <div>
          {bands.length > 0 ? (
            <ul style={styles.bandList}>
              {bands.map((band) => {
                return (
                  <li key={band.id} style={styles.bandItem}>
                    <h2>{band.bandname}</h2>
                    <h4>{band.hometown}</h4>
                    <p>
                      <strong>Genre:</strong> {band.genre}
                    </p>
                    <p>
                      <strong>Year Started:</strong> {band.yearstarted}
                    </p>
                    <p>
                      <strong>Members:</strong> {band.membernames.join(', ')}
                    </p>
                    <Link href={`/bands/${band.id}`} passHref>
                      <button style={styles.viewDetailsButton}>View Details</button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p style={styles.noBands}>No bands found.</p>
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
  bandList: {
    listStyleType: 'none',
    padding: 0,
  },
  bandItem: {
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
  noBands: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#333',
  },
  noPermission: {
    color: 'red',
    textAlign: 'center',
  },
};

export default BandList;
