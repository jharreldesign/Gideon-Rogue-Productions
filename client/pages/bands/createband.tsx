import React, { useState } from "react";
import axios from "axios";

const CreateBand: React.FC = () => {
  const [formData, setFormData] = useState({
    bandname: "",
    hometown: "",
    genre: "",
    yearstarted: "",
    membernames: "",
    bandphoto: "", // Updated from 'tour_image' to 'bandphoto'
    banddescription: "", // Added 'banddescription' field
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://127.0.0.1:5000/bands",
        {
          ...formData,
          yearstarted: parseInt(formData.yearstarted, 10),
          membernames: formData.membernames
            .split(",")
            .map((name) => name.trim()),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Band added successfully!");
      setFormData({
        bandname: "",
        hometown: "",
        genre: "",
        yearstarted: "",
        membernames: "",
        bandphoto: "",
        banddescription: "", // Clear the banddescription field
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error adding band:",
          error.response?.data || error.message
        );
        alert(
          `Failed to add band: ${
            error.response?.data?.message || "Please try again."
          }`
        );
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="bandname">Band Name:</label>
        <input
          type="text"
          id="bandname"
          name="bandname"
          value={formData.bandname}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="hometown">Hometown:</label>
        <input
          type="text"
          id="hometown"
          name="hometown"
          value={formData.hometown}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="genre">Genre:</label>
        <input
          type="text"
          id="genre"
          name="genre"
          value={formData.genre}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="yearstarted">Year Started:</label>
        <input
          type="number"
          id="yearstarted"
          name="yearstarted"
          value={formData.yearstarted}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="membernames">Member Names (comma-separated):</label>
        <textarea
          id="membernames"
          name="membernames"
          value={formData.membernames}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="banddescription">Band Description:</label>
        <textarea
          id="banddescription"
          name="banddescription"
          value={formData.banddescription}
          onChange={handleChange}
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="bandphoto">Band Photo URL:</label>
        <input
          type="url"
          id="bandphoto"
          name="bandphoto"
          value={formData.bandphoto}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit">Add Band</button>
    </form>
  );
};

export default CreateBand;
