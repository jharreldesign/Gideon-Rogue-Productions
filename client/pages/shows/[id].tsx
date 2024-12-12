import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import style from '../../styles/EventDetails.module.css';

interface Show {
  id: number;
  showdate: string;
  showdescription: string;
  showtime: string;
  location: string;
  bandsplaying: string[];
  bandPhoto: string;
  ticketPrice: string;
  fbEventLink: string;
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
              <p>{show.showtime}</p>
            </div>
            <div>
              <strong>Location:</strong>
              <p>{show.location}</p>
            </div>
            <div>
              <strong>Price:</strong>
              <p>{show.ticketPrice}</p>
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
            {show.fbEventLink && (
              <a href={show.fbEventLink} className={style.fbEvent}>
                FB EVENT
              </a>
            )}
          </div>

          {/* Social Media Share Buttons */}
          <div className={style.actions}>
            <button>Share on Facebook</button>
            <button>Share on Twitter</button>
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
