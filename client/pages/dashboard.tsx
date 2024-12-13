import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";

interface Show {
  id: number;
  showdescription: string;
  showdate: string;
}

interface User {
  id: number;
  username: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [shows, setShows] = useState<Show[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found");
      return;
    }

    // Fetch user info
    fetch("http://127.0.0.1:5000/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to authenticate user.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUsername(data.username);
          setUserRole(data.role);

          if (data.role === "admin") {
            fetchUsers(token); // Fetch users if admin
          }
          fetchUpcomingShows(token); // Fetch upcoming shows for all users
        }
      })
      .catch((err: Error) => setError(`Error fetching user data: ${err.message}`));
  }, []);

  const fetchUpcomingShows = (token: string) => {
    fetch("http://127.0.0.1:5000/shows", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch shows.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setShows(data.shows || []);
        }
      })
      .catch((err: Error) => setError(`Error fetching shows: ${err.message}`));
  };

  const fetchUsers = (token: string) => {
    fetch("http://127.0.0.1:5000/auth/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch users.");
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUsers(data || []);
        }
      })
      .catch((err: Error) => setError(`Error fetching users: ${err.message}`));
  };

  return (
    <div className="dashboard-container">
      <h1 className="text-4xl font-bold text-center">Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      {username && <p className="text-lg">Welcome, {username}!</p>}

      {userRole === "admin" && (
        <div className="section-container">
          <h2 className="section-title">Staff Members</h2>
          {users.length > 0 ? (
            <ul className="user-list">
              {users.map((user) => (
                <li key={user.id} className="user-item">
                  {user.username} - Role: {user.role}
                </li>
              ))}
            </ul>
          ) : (
            <p>No staff members found.</p>
          )}
        </div>
      )}

      <div className="section-container">
        <h2 className="section-title">Upcoming Shows</h2>
        {shows.length > 0 ? (
          <ul className="show-list">
            {shows.map((show) => (
              <li key={show.id} className="show-item">
                {show.showdescription} -{" "}
                {new Date(show.showdate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming shows found.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
