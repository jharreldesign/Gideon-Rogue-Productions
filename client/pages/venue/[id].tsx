import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';  // Import Image from next/image
import Link from "next/link";
import style from '../../styles/VenueDetails.module.css';

interface Event {
  id: number;
  showdate: string;
  showdescription: string;
  showtime: string;
  location: string;
  bandsplaying: string;
  ticketprice: number;
  user_id: number;
  tourposter: string;
  venueId: number;  // Ensuring venueId is present
}

interface Venue {
  id: number;
  venuename: string;
  location: string;
  capacity: number;
  venuemanager: string;
  venuePhoto: string;
  events: Event[];  // Ensure the venue object has events
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
        setVenue(data.venue); // Assuming the venue object includes events
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
              backgroundImage: `url(${venue.venuePhoto})`, // Use the venue photo URL from the venue data
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
            <div>
              <strong>Venue Manager:</strong>
              <p>{venue.venuemanager}</p>
            </div>
          </div>

          {/* Upcoming Events */}
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className={style.eventList}>
            {venue.events?.length > 0 ? (
              venue.events.map((event) => (
                <div key={event.id} className={style.eventItem}>
                  <h3>{event.showdescription}</h3>
                  <p><strong>Date:</strong> {new Date(event.showdate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {event.showtime}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Bands Playing:</strong> {event.bandsplaying}</p>
                  <p><strong>Ticket Price:</strong> ${event.ticketprice}</p>
                  {event.tourposter && (
                    <Image
                      src={event.tourposter}
                      alt={`Tour poster for ${event.showdescription}`}
                      className={style.tourPoster}
                      width={500}  // Set width and height based on your design needs
                      height={750} // Adjust the height accordingly
                      layout="responsive"  // This will make the image responsive
                    />
                  )}
                  <Link href={`/shows/${event.id}`} className={style.eventLink}>
                    View Details
                  </Link>
                </div>
              ))
            ) : (
              <p>No upcoming events at this venue.</p>
            )}
          </div>

          {/* Back Link */}
          <div className={style.backLink}>
            <Link href="/venue/VenueList">Back to Venues</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default VenueDetail;
