import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import style from "../../../styles/BandEdit.module.css";
import Link from "next/link";

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

const EditBand: React.FC = () => {
  const [formData, setFormData] = useState<Band | null>(null);
  const [error, setError] = useState<string | null>(null); // Error state to track the error message
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchBandDetails(id as string);
    }
  }, [id]);

  const fetchBandDetails = async (bandId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bands/edit/${bandId}`); // Update URL structure
      const data = await response.json();
      if (data.error) {
        setError(data.error); // Set the error if there's an issue with the data
      } else {
        const bandData: Band = {
          ...data.band,
          id: data.band.id || 0,
        };
        setFormData(bandData); // Set the form data with the band information
      }
    } catch (err: unknown) {
      // Handle the error properly with type assertion
      if (err instanceof Error) {
        setError(err.message); // Use the error message from the Error object
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "membernames") {
      setFormData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: value.split(",").map((member) => member.trim()),
        };
      });
    } else {
      setFormData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    if (formData) {
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/bands/edit/${formData.id}`,
          {
            ...formData,
            yearstarted: parseInt(formData.yearstarted.toString(), 10),
            membernames: `{${formData.membernames.map(name => `"${name}"`).join(",")}}`, // Convert to PostgreSQL array format
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Band updated successfully!");
        router.push(`/bands/${formData.id}`);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error(
            "Error updating band:",
            error.response?.data || error.message
          );
          alert(
            `Failed to update band: ${
              error.response?.data?.message || "Please try again."
            }`
          );
        } else {
          console.error("Unexpected error:", error);
          alert("An unexpected error occurred. Please try again.");
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      {error && <p className="text-red-500">{error}</p>} {/* Display error message here */}

      {formData && (
        <>
          <div
            className={style.heroImage}
            style={{
              backgroundImage: `url(${formData.bandphoto})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className={style.heroText}>
              <h1>{formData.bandname}</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={style.form}>
            <div className={style.formGroup}>
              <label htmlFor="bandname" className={style.label}>
                Band Name:
              </label>
              <input
                type="text"
                id="bandname"
                name="bandname"
                value={formData.bandname}
                onChange={handleChange}
                required
                className={style.input}
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="hometown" className={style.label}>
                Hometown:
              </label>
              <input
                type="text"
                id="hometown"
                name="hometown"
                value={formData.hometown}
                onChange={handleChange}
                required
                className={style.input}
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="genre" className={style.label}>
                Genre:
              </label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
                className={style.input}
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="yearstarted" className={style.label}>
                Year Started:
              </label>
              <input
                type="number"
                id="yearstarted"
                name="yearstarted"
                value={formData.yearstarted}
                onChange={handleChange}
                required
                className={style.input}
              />
            </div>

            <div className={style.formGroup}>
              <label
                htmlFor="membernames"
                className={style.label}
              >
                Member Names (comma-separated):
              </label>
              <textarea
                id="membernames"
                name="membernames"
                value={formData.membernames.join(", ")}
                onChange={handleChange}
                required
                className={style.input}
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="banddescription" className={style.label}>
                Band Description:
              </label>
              <textarea
                id="banddescription"
                name="banddescription"
                value={formData.banddescription}
                onChange={handleChange}
                rows={4}
                className={style.input}
              />
            </div>

            <div className={style.formGroup}>
              <label htmlFor="bandphoto" className={style.label}>
                Band Photo URL:
              </label>
              <input
                type="url"
                id="bandphoto"
                name="bandphoto"
                value={formData.bandphoto}
                onChange={handleChange}
                required
                className={style.input}
              />
            </div>

            <button type="submit" className={style.submitButton}>
              Update Band
            </button>
          </form>

          <div className={style.bandLink}>
            <Link href={`/bands/${formData.id}`} className={style.backLink}>
              Back to Band Details
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default EditBand;





// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import axios from "axios";
// import style from "../../../styles/BandEdit.module.css";
// import Link from "next/link";


// interface Band {
//   id: number;
//   bandname: string;
//   hometown: string;
//   genre: string;
//   yearstarted: number;
//   membernames: string[];
//   banddescription: string;
//   bandphoto: string;
// }

// const EditBand: React.FC = () => {
//   const [formData, setFormData] = useState<Band | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const { id } = router.query;

//   useEffect(() => {
//     if (id) {
//       fetchBandDetails(id as string);
//     }
//   }, [id]);

//   const fetchBandDetails = async (bandId: string) => {
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${bandId}`);
//       const data = await response.json();
//       if (data.error) {
//         setError(data.error);
//       } else {
//         const bandData: Band = {
//           ...data.band,
//           id: data.band.id || 0,
//         };
//         setFormData(bandData);
//       }
//     } catch {
//       setError("Error fetching band details");
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;

//     if (name === "membernames") {
//       setFormData((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           [name]: value.split(",").map((member) => member.trim()),
//         };
//       });
//     } else {
//       setFormData((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           [name]: value,
//         };
//       });
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const token = localStorage.getItem("token");
  
//     if (formData) {
//       try {
//         await axios.put(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/${formData.id}`,
//           {
//             ...formData,
//             yearstarted: parseInt(formData.yearstarted.toString(), 10),
//             membernames: `{${formData.membernames.map(name => `"${name}"`).join(",")}}`, // Convert to PostgreSQL array format
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         alert("Band updated successfully!");
//         router.push(`/bands/${formData.id}`);
//       } catch (error: unknown) {
//         if (axios.isAxiosError(error)) {
//           console.error(
//             "Error updating band:",
//             error.response?.data || error.message
//           );
//           alert(
//             `Failed to update band: ${
//               error.response?.data?.message || "Please try again."
//             }`
//           );
//         } else {
//           console.error("Unexpected error:", error);
//           alert("An unexpected error occurred. Please try again.");
//         }
//       }
//     }
//   };
  

//   return (
//     <div className="container mx-auto p-6">
//       {error && <p className="text-red-500">{error}</p>}

//       {formData && (
//         <>
//           <div
//             className={style.heroImage}
//             style={{
//               backgroundImage: `url(${formData.bandphoto})`,
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//             }}
//           >
//             <div className={style.heroText}>
//               <h1>{formData.bandname}</h1>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className={style.form}>
//             <div className={style.formGroup}>
//               <label htmlFor="bandname" className={style.label}>
//                 Band Name:
//               </label>
//               <input
//                 type="text"
//                 id="bandname"
//                 name="bandname"
//                 value={formData.bandname}
//                 onChange={handleChange}
//                 required
//                 className={style.input}
//               />
//             </div>

//             <div className={style.formGroup}>
//               <label htmlFor="hometown" className={style.label}>
//                 Hometown:
//               </label>
//               <input
//                 type="text"
//                 id="hometown"
//                 name="hometown"
//                 value={formData.hometown}
//                 onChange={handleChange}
//                 required
//                 className={style.input}
//               />
//             </div>

//             <div className={style.formGroup}>
//               <label htmlFor="genre" className={style.label}>
//                 Genre:
//               </label>
//               <input
//                 type="text"
//                 id="genre"
//                 name="genre"
//                 value={formData.genre}
//                 onChange={handleChange}
//                 required
//                 className={style.input}
//               />
//             </div>

//             <div className={style.formGroup}>
//               <label htmlFor="yearstarted" className={style.label}>
//                 Year Started:
//               </label>
//               <input
//                 type="number"
//                 id="yearstarted"
//                 name="yearstarted"
//                 value={formData.yearstarted}
//                 onChange={handleChange}
//                 required
//                 className={style.input}
//               />
//             </div>

//             <div className={style.formGroup}>
//               <label
//                 htmlFor="membernames"
//                 className={style.label}
//               >
//                 Member Names (comma-separated):
//               </label>
//               <textarea
//                 id="membernames"
//                 name="membernames"
//                 value={formData.membernames.join(", ")}
//                 onChange={handleChange}
//                 required
//                 className={style.input}
//               />
//             </div>

//             <div className={style.formGroup}>
//               <label htmlFor="banddescription" className={style.label}>
//                 Band Description:
//               </label>
//               <textarea
//                 id="banddescription"
//                 name="banddescription"
//                 value={formData.banddescription}
//                 onChange={handleChange}
//                 rows={4}
//                 className={style.input}
//               />
//             </div>

//             <div className={style.formGroup}>
//               <label htmlFor="bandphoto" className={style.label}>
//                 Band Photo URL:
//               </label>
//               <input
//                 type="url"
//                 id="bandphoto"
//                 name="bandphoto"
//                 value={formData.bandphoto}
//                 onChange={handleChange}
//                 required
//                 className={style.input}
//               />
//             </div>

//             <button type="submit" className={style.submitButton}>
//               Update Band
//             </button>
//           </form>

//           <div className={style.bandLink}>
//             <Link href={`/bands/${formData.id}`} className={style.backLink}>
//               Back to Band Details
//             </Link>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default EditBand;
