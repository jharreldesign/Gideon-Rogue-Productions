import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import style from "../../styles/BandDetails.module.css";
import Link from "next/link";

// Define the type for Band
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

  // Fetch band details when 'id' changes
  useEffect(() => {
    if (id) {
      fetchBandDetails(id as string);
    }
  }, [id]);

  // Fetch band details
  const fetchBandDetails = async (bandId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bands/${bandId}`);
      const data = await response.json();
      
      // Handle API errors
      if (data.error) {
        setError(data.error);
      } else {
        setBand(data.band);
      }
    } catch {
      setError("Error fetching band details");
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    if (band) {
      router.push(`/bands/edit/${band.id}`);
    }
  };

  // Handle delete button click
  const handleDelete = async () => {
    if (!band) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bands/${band.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        alert("Band deleted successfully!");
        router.push("/bands/BandList");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error deleting the band");
        console.error("Error deleting band:", errorData);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6">
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {band && (
        <>
          {/* Hero Image Section */}
          <div
            className={style.heroImage}
            style={{
              backgroundImage: `url(${band.bandphoto})`,
            }}
          >
            <div className={style.heroText}>
              <h1>{band.bandname}</h1>
            </div>
          </div>

          {/* Band Info Section */}
          <div className={`${style.bandInfo} max-w-3xl mx-auto`}>
            <div className="mb-6">
              <strong className="text-xl">Hometown:</strong>
              <p>{band.hometown}</p>
            </div>
            <div className="mb-6">
              <strong className="text-xl">Genre:</strong>
              <p>{band.genre}</p>
            </div>
            <div className="mb-6">
              <strong className="text-xl">Year Started:</strong>
              <p>{band.yearstarted}</p>
            </div>
            <div className="mb-6">
              <strong className="text-xl">Members:</strong>
              <ul className={style.bandList}>
                {band.membernames.map((member, index) => (
                  <li key={index}>{member}</li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <strong className="text-xl">Description:</strong>
              <p>{band.banddescription}</p>
            </div>
          </div>

          {/* Edit, Delete, and Back Buttons */}
          <div className="mt-8 flex gap-6 justify-end">
            <button onClick={handleEdit} className={style["btn-primary"]}>
              Edit Band
            </button>
            <button onClick={handleDelete} className={style["btn-danger"]}>
              Delete Band
            </button>
            <button>
              <Link href="/bands/BandList" className={style["btn-primary"]}>
                Back to Bands
              </Link>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BandDetail;


// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import style from "../../styles/BandDetails.module.css";
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

// const BandDetail: React.FC = () => {
//   const [band, setBand] = useState<Band | null>(null);
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
//         setBand(data.band);
//       }
//     } catch {
//       setError("Error fetching band details");
//     }
//   };

//   const handleEdit = () => {
//     if (band) {
//       router.push(`/bands/edit/${band.id}`);
//     }
//   };

//   const handleDelete = async () => {
//     if (!band) return;

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${band.id}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       if (response.ok) {
//         alert("Band deleted successfully!");
//         router.push("/bands/BandList");
//       } else {
//         const errorData = await response.json();
//         setError(errorData.error || "Error deleting the band");
//         console.error("Error deleting band:", errorData);
//       }
//     } catch (err) {
//       console.error("Unexpected error:", err);
//       setError("An unexpected error occurred. Please try again.");
//     }
//   };

//   return (
//     <div className="container mx-auto p-6">
//       {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

//       {band && (
//         <>
//           {/* Hero Image Section */}
//           <div
//             className={style.heroImage}
//             style={{
//               backgroundImage: `url(${band.bandphoto})`,
//             }}
//           >
//             <div className={style.heroText}>
//               <h1>{band.bandname}</h1>
//             </div>
//           </div>

//           {/* Band Info Section */}
//           <div className={`${style.bandInfo} max-w-3xl mx-auto`}>
//             <div className="mb-6">
//               <strong className="text-xl">Hometown:</strong>
//               <p>{band.hometown}</p>
//             </div>
//             <div className="mb-6">
//               <strong className="text-xl">Genre:</strong>
//               <p>{band.genre}</p>
//             </div>
//             <div className="mb-6">
//               <strong className="text-xl">Year Started:</strong>
//               <p>{band.yearstarted}</p>
//             </div>
//             <div className="mb-6">
//               <strong className="text-xl">Members:</strong>
//               <ul className={style.bandList}>
//                 {band.membernames.map((member, index) => (
//                   <li key={index}>{member}</li>
//                 ))}
//               </ul>
//             </div>
//             <div className="mb-6">
//               <strong className="text-xl">Description:</strong>
//               <p>{band.banddescription}</p>
//             </div>
//           </div>

//           {/* Edit, Delete, and Back Buttons */}
//           <div className="mt-8 flex gap-6 justify-end">
//             <button onClick={handleEdit} className={style["btn-primary"]}>
//               Edit Band
//             </button>
//             <button onClick={handleDelete} className={style["btn-danger"]}>
//               Delete Band
//             </button>
//             <button>
//               <Link href="/bands/BandList" className={style["btn-primary"]}>
//                 Back to Bands
//               </Link>
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default BandDetail;
