import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

const VenueCreate: React.FC = () => {
  const [formData, setFormData] = useState({
    capacity: '',
    venuename: '',
    location: '',
    venuemanager: '',
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setErrorMessage('Authentication token is missing.');
        return;
      }

      const response = await axios.post(
        'http://127.0.0.1:5000/venues',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Venue created successfully:', response.data);
      router.push('/venue/VenueList');

      setFormData({
        capacity: '',
        venuename: '',
        location: '',
        venuemanager: '',
      });
    } catch (error) {
      const axiosError = error as AxiosError;

      console.error('Error creating venue:', axiosError.response?.data || axiosError.message);
      setErrorMessage('Failed to create venue. Please try again later.');
    }
  };

  return (
    <div>
      <Header />
      <h2>Create a New Venue</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="capacity">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="venuename">Venue Name</label>
          <input
            type="text"
            id="venuename"
            name="venuename"
            value={formData.venuename}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="venuemanager">Venue Manager</label>
          <input
            type="text"
            id="venuemanager"
            name="venuemanager"
            value={formData.venuemanager}
            onChange={handleChange}
            required
          />
        </div>

        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

        <div>
          <button type="submit">Create Venue</button>
        </div>
      </form>
    </div>
  );
};

export default VenueCreate;
