import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import style from '../../styles/EventDetails.module.css';

interface Show {
  id: number;
  showdate: string;
  showdescription: string;
  showtime: string; // Assuming showtime is in 24-hour format, like '14:30'
  location: string;
  bandsplaying: string[]; 
  bandPhoto: string; 
  ticketprice: number;
}

const ShowDetail: React.FC = () => {
  const [show, setShow] = useState<Show | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchShowDetails(id as string);
    }
  }, [id]);

  const fetchShowDetails = async (showId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/shows/${showId}`);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setShow(data.show);
      }
    } catch {
      setError('Error fetching show details');
    }
  };

  // Function to format the time to a 12-hour format with AM/PM
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number); // Assuming time format is "HH:MM"
    const date = new Date();
    date.setHours(hours, minutes);

    // Use toLocaleString for 12-hour format with AM/PM
    return date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className={style.container}>
      {error && <p className="text-red-500">{error}</p>}

      {show && (
        <>
          {/* Hero Image */}
          <div
            className={style.heroImage}
            style={{
              backgroundImage: `url(${show.bandPhoto})`,
            }}
          >
            <div className={style.heroText}>
              <h1>{show.bandsplaying.join(' & ')}</h1>
              <p>{new Date(show.showdate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Show Info */}
          <div className={style.eventInfo}>
            <div>
              <strong>Date:</strong>
              <p>{new Date(show.showdate).toLocaleDateString()}</p>
            </div>
            <div>
              <strong>Time:</strong>
              <p>{formatTime(show.showtime)}</p> {/* Format the showtime */}
            </div>
            <div>
              <strong>Location:</strong>
              <p>{show.location}</p>
            </div>
            <div>
              <strong>Price:</strong>
              <p>{show.ticketprice}</p>
            </div>
          </div>

          {/* Description */}
          <h2 className="text-xl font-semibold">Description</h2>
          <p>{show.showdescription}</p>

          {/* Band Members */}
          <div className={style.bandList}>
            {show.bandsplaying.map((band, index) => (
              <div key={index} className={style.bandItem}>
                <h3 className={style.bandName}>{band}</h3>
                <p className={style.bandMembers}>Band Members Placeholder</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className={style.actions}>
            <a href="https://www.masqueradeatlanta.com/tickets" className={style.buyTicket}>
              BUY TICKETS
            </a>
          </div>

          {/* Back Link */}
          <div className={style.backLink}>
            <a href="/event/EventList">Back to Events</a>
          </div>
        </>
      )}
    </div>
  );
};

export default ShowDetail;
