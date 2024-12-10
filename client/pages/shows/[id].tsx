import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

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
    <div className="container mx-auto p-5">
      <Header /> {/* Add the Header component here */}

      {error && <p className="text-red-500">{error}</p>}

      {show && (
        <>
          {/* Hero Image */}
          <div
            className="relative h-72 bg-cover bg-center"
            style={{
              backgroundImage: `url(${show.bandPhoto})`,
            }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
              <h1 className="text-4xl font-bold">{show.bandsplaying.join(' & ')}</h1>
              <p className="text-lg">{new Date(show.showdate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Social Media and Event Info */}
          <div className="my-4 flex gap-4">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-700 text-white rounded">
              Facebook
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-700 text-white rounded">
              Instagram
            </a>
            <a href="https://www.twitter.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-700 text-white rounded">
              Twitter
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-700 text-white rounded">
              TikTok
            </a>
            <a href="mailto:info@masqueradeatlanta.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-700 text-white rounded">
              Email
            </a>
            <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-700 text-white rounded">
              Spotify
            </a>
          </div>

          {/* Show Details */}
          <div className="my-8">
            <div className="grid grid-cols-2 gap-4">
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

            <h2 className="mt-6 text-xl font-semibold">Description</h2>
            <p>{show.showdescription}</p>
            
            {/* Action Buttons */}
            <div className="my-8 flex gap-4">
              <a href="https://www.masqueradeatlanta.com/tickets" className="px-6 py-2 bg-purple-700 text-white rounded">
                BUY TICKETS
              </a>
              {show.fbEventLink && (
                <a href={show.fbEventLink} className="px-6 py-2 bg-blue-600 text-white rounded">
                  FB EVENT
                </a>
              )}
              <div className="flex gap-4">
                <button className="px-6 py-2 bg-blue-600 text-white rounded">
                  Share on Facebook
                </button>
                <button className="px-6 py-2 bg-blue-400 text-white rounded">
                  Share on Twitter
                </button>
              </div>
            </div>
          </div>

          <div className="my-6">
            <a href="/events" className="text-blue-500 hover:text-blue-700">
              Back to Events
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default ShowDetail;
