import Link from 'next/link';
import styles from '../styles/EventList.module.css';

// Updated Show type to match the fetched data structure in Index.tsx
interface Show {
  id: number;
  showdate: string;
  showdescription: string;
  bandsplaying: string[];
}

interface EventListProps {
  shows: Show[];
  error: string | null;
}

const EventList: React.FC<EventListProps> = ({ shows, error }) => {
  return (
    <div>
      <div className={styles.container}>
        <h1 className={styles.title}>Event List</h1>
        {error && <p className={styles.error}>{error}</p>}
        <div>
          {shows.length > 0 ? (
            <ul className={styles.showList}>
              {shows.map((show) => (
                <li key={show.id} className={styles.showItem}>
                  <h2>{show.bandsplaying}</h2> {/* Assuming this is a string */}
                  <h4>{show.showdescription}</h4>
                  <p>
                    <strong>Date:</strong> {new Date(show.showdate).toLocaleDateString()}
                  </p>
                  {/* No showtime, location, or ticketprice here */}
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
