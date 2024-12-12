import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import style from '../../styles/BandDetails.module.css';

interface Band {
  id: number;
  bandname: string;
  hometown: string; 
  genre: string;
  yearstarted: number; 
  membernames: string[];
  description: string; 
  bandphoto: string;
}

const BandDetail: React.FC = () => {
  const [band, setBand] = useState<Band | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchBandDetails(id as string);
    }
  }, [id]);

  const fetchBandDetails = async (bandId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/bands/${bandId}`);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setBand(data.band);
      }
    } catch {
      setError('Error fetching band details');
    }
  };

  return (
    <div className="container mx-auto p-6">
      {error && <p className="text-red-500">{error}</p>}

      {band && (
        <>
          {/* Hero Image Section */}
          <div
            className={style.heroImage}
            style={{
              backgroundImage: `url(${band.bandphoto})`,
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
            }}
          >
            <div className={style.heroText}>
              <h1>{band.bandname}</h1>
            </div>
          </div>

          {/* Band Info Section */}
          <div className={style.bandInfo}>
            <div className="mb-4">
              <strong>Hometown:</strong>
              <p>{band.hometown}</p>
            </div>
            <div className="mb-4">
              <strong>Genre:</strong>
              <p>{band.genre}</p>
            </div>
            <div className="mb-4">
              <strong>Year Started:</strong>
              <p>{band.yearstarted}</p>
            </div>
            <div className="mb-4">
              <strong>Members:</strong>
              <ul className={style.bandList}>
                {band.membernames.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <strong>Description:</strong>
              <p>{band.description}</p>
            </div>
          </div>

          {/* Back Link */}
          <div className={style.bandLink}>
            <a href="/bands">Back to Bands</a>
          </div>
        </>
      )}
    </div>
  );
};

export default BandDetail;
