import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import style from '../../styles/EventDetails.module.css';
import Modal from '../../components/Modal'; 
import Image from 'next/image';
import Link from "next/link";

interface Show {
  id: number;
  showdate: string;
  showdescription: string;
  showtime: string; 
  location: string;
  bandsplaying: string[];
  bandPhoto: string;
  ticketprice: number;
  tourposter: string;
}

const ShowDetail: React.FC = () => {
  const [show, setShow] = useState<Show | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchShowDetails(id as string);
    }
  }, [id]);

  const fetchShowDetails = async (showId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shows/${showId}`);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setShow(data.show);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);  // Use the error's message
      } else {
        setError('Error fetching show details');
      }
    }
  };
  

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number); 
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const openModal = () => {
    setIsModalOpen(true); 
  };

  const closeModal = () => {
    setIsModalOpen(false); 
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
              backgroundImage: `url(${show.tourposter})`, 
            }}
          >
            <div className={style.heroText}>
              <h1>{show.bandsplaying.join(' & ')}</h1>
              <p>{new Date(show.showdate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Show Info */}
          <div className={style.eventInfo}>
            <div className={style.bandInfo}>
              <p><strong>Date:</strong> {new Date(show.showdate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {formatTime(show.showtime)}</p> 
              <p><strong>Location:</strong> {show.location}</p>
              <p><strong>Price:</strong> ${show.ticketprice}</p>
            </div>

            {/* Tour Poster Image */}
            <div className={style.tourPosterContainer} onClick={openModal}>
              <Image
                src={show.tourposter}
                alt="Tour Poster"
                layout="responsive" 
                width={1200} 
                height={800} 
                objectFit="contain" 
                className={style.tourPoster} 
              />
            </div>
          </div>

          {/* Description */}
          <h2 className="text-xl font-semibold">Description</h2>
          <p>{show.showdescription}</p>

          {/* Band Members */}
          <div className={style.bandList}>
            {show.bandsplaying.map((band, index) => (
              <div key={index} className={style.bandItem}>
                <h3 className={style.bandname}>{band}</h3>
                <p className={style.bandmembers}>Band Members Placeholder</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className={style.actions}>
            <Link href={`/tickets/${show.id}`} className={style.buyTicket}>
              BUY TICKETS
            </Link>
          </div>

          {/* Back Link */}
          <div className={style.backLink}>
            <Link href="/event/EventList">Back to Events</Link>
          </div>

          {/* Modal */}
          <Modal isOpen={isModalOpen} onClose={closeModal} imageSrc={show.tourposter} />
        </>
      )}
    </div>
  );
};

export default ShowDetail;
