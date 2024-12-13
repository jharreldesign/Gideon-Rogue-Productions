import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/router";
import styles from '../../styles/ShowCreate.module.css'; 
import Image from 'next/image';

interface FormData {
  showdate: string;
  showdescription: string;
  showtime: string;
  location: string;
  bandsplaying: string[];
  ticketprice: string;
  tourposter: string; 
}

interface Venue {
  capacity: number;
  id: number;
  location: string;
  venuemanager: string;
  venuename: string;
}

const ShowCreate: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    showdate: "",
    showdescription: "",
    showtime: "",
    location: "",
    bandsplaying: [],
    ticketprice: "",
    tourposter: "", // Initially empty
  });

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bands, setBands] = useState<{ bandname: string; id: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchVenuesAndBands = async () => {
      try {
        const [venuesResponse, bandsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:5000/venues"),
          axios.get("http://127.0.0.1:5000/bands"),
        ]);

        setVenues(venuesResponse.data.venues);
        setBands(bandsResponse.data.bands);
      } catch (error) {
        const axiosError = error as AxiosError;
        setErrorMessage(
          "Failed to load venues and bands. Please try again later."
        );
        console.error(
          "Error fetching venues and bands:",
          axiosError.response?.data || axiosError.message
        );
      }
    };

    fetchVenuesAndBands();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "bandsplaying") {
      const options = (e.target as HTMLSelectElement).options;
      const selectedBands = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);

      setFormData((prevData) => ({ ...prevData, [name]: selectedBands }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMessage("Authentication token is missing.");
        return;
      }

      const date = formData.showdate;
      const time = formData.showtime;

      const showtime = `${date} ${time}:00`;

      const updatedFormData = { ...formData, showtime };

      await axios.post("http://127.0.0.1:5000/shows", updatedFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.push("/event/EventList");

      setFormData({
        showdate: "",
        showdescription: "",
        showtime: "",
        location: "",
        bandsplaying: [],
        ticketprice: "",
        tourposter: "",
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        "Error creating show:",
        axiosError.response?.data || axiosError.message
      );
      setErrorMessage("Failed to create show. Please try again later.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create a New Show</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="showdate" className={styles.label}>Show Date</label>
          <input
            type="date"
            id="showdate"
            name="showdate"
            value={formData.showdate}
            onChange={handleChange}
            required
            className={styles.inputElement}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="showdescription" className={styles.label}>Description</label>
          <textarea
            id="showdescription"
            name="showdescription"
            value={formData.showdescription}
            onChange={handleChange}
            required
            className={styles.textareaElement}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="showtime" className={styles.label}>Show Time</label>
          <input
            type="time"
            id="showtime"
            name="showtime"
            value={formData.showtime}
            onChange={handleChange}
            required
            className={styles.inputElement}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="location" className={styles.label}>Location</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className={styles.selectElement}
          >
            <option value="">Select Venue</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.venuename}>
                {venue.venuename}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="bandsplaying" className={styles.label}>Bands Playing</label>
          <select
            id="bandsplaying"
            name="bandsplaying"
            value={formData.bandsplaying}
            onChange={handleChange}
            multiple
            required
            className={styles.selectElement}
          >
            {bands.map((band) => (
              <option key={band.id} value={band.bandname}>
                {band.bandname}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="ticketprice" className={styles.label}>Ticket Price</label>
          <input
            type="number"
            id="ticketprice"
            name="ticketprice"
            value={formData.ticketprice}
            onChange={handleChange}
            required
            className={styles.inputElement}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="tourposter" className={styles.label}>Tour Poster URL</label>
          <input
            type="url"
            id="tourposter"
            name="tourposter"
            value={formData.tourposter}
            onChange={handleChange}
            placeholder="Enter the URL for the tour poster"
            className={styles.inputElement}
          />
          {formData.tourposter && (
            <Image
              src={formData.tourposter}
              alt="Tour Poster Preview"
              width={500}  
              height={300} 
              className={styles.posterPreview}
            />
          )}
        </div>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <div className={styles.submitButtonContainer}>
          <button type="submit" className={styles.submitButton}>Create Show</button>
        </div>
      </form>
    </div>
  );
};

export default ShowCreate;
