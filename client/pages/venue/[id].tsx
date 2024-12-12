import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import style from '../../styles/VenueDetails.module.css';

interface Venue {
  id: number;
  venuename: string;
  location: string;
  capacity: number;
  venuemanager: string;
  venuePhoto: string;
  events: { id: number; name: string; date: string }[];
}

const VenueDetail: React.FC = () => {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { id } = router.query;
  
    useEffect(() => {
      if (id) {
        fetchVenueDetails(id as string);
      }
    }, [id]);
  
    const fetchVenueDetails = async (venueId: string) => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/venues/${venueId}`);
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setVenue(data.venue);
        }
      } catch {
        setError('Error fetching venue details');
      }
    };
  
    return (
      <div className={style.container}>
        {error && <p className="text-red-500">{error}</p>}
  
        {venue && (
          <>
            {/* Hero Image */}
            <div
              className={style.heroImage}
              style={{
                backgroundImage: `url("https://pbs.twimg.com/media/Fwa1-kdXgAA6t9r.jpg:large")`,
              }}
            >
              <div className={style.heroText}>
                <h1>{venue.venuename}</h1>
                <p>{venue.location}</p>
              </div>
            </div>
  
            {/* Venue Info */}
            <div className={style.venueInfo}>
              <div>
                <strong>Location:</strong>
                <p>{venue.location}</p>
              </div>
              <div>
                <strong>Capacity:</strong>
                <p>{venue.capacity}</p>
              </div>
              {/* <div>
                <strong>Manager:</strong>
                <p>{venue.venuemanager}</p>
              </div> */}
            </div>
  
            {/* Upcoming Events */}
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <div className={style.eventList}>
              {venue.events && venue.events.length > 0 ? (
                venue.events.map((event) => (
                  <div key={event.id} className={style.eventItem}>
                    <h3>{event.name}</h3>
                    <p>{new Date(event.date).toLocaleDateString()}</p>
                    <a href={`/shows/${event.id}`} className={style.eventLink}>
                      View Details
                    </a>
                  </div>
                ))
              ) : (
                <p>No upcoming events at this venue.</p>
              )}
            </div>
  
            {/* Back Link */}
            <div className={style.backLink}>
              <a href="/venue/VenueList">Back to Venues</a>
            </div>
          </>
        )}
      </div>
    );
  };
  
  export default VenueDetail;
  