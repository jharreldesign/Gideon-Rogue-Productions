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
  banddescription: string;
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

  // Edit button click handler
  const handleEdit = () => {
    if (band) {
      router.push(`/bands/edit/${band.id}`);
    }
  };

  // Delete button click handler
  const handleDelete = async () => {
    if (!band) return;
  
    try {
      const response = await fetch(`http://127.0.0.1:5000/bands/${band.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with your token storage method
        },
      });
  
      if (response.ok) {
        alert('Band deleted successfully!');
        router.push('/bands/BandList');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error deleting the band');
        console.error('Error deleting band:', errorData);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
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
              <p>{band.banddescription}</p>
            </div>
          </div>

          {/* Edit and Delete Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleEdit}
              className={`${style.button} px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700`}
            >
              Edit Band
            </button>
            <button
              onClick={handleDelete}
              className={`${style.button} px-6 py-2 bg-red-500 text-white rounded hover:bg-red-700`}
            >
              Delete Band
            </button>
          </div>

          {/* Back Link */}
          <div className={style.bandLink}>
            <a href="/bands/BandList">Back to Bands</a>
          </div>
        </>
      )}
    </div>
  );
};

export default BandDetail;
