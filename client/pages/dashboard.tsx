import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import EventList from '../pages/event/EventList';

interface Show {
  id: number;
  bandsplaying: string[];
  showdescription: string;
  showdate: string;
  showtime: string;
  location: string;
  ticketprice: number;
  tourposter: string;
  tourUrl: string;
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

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUsername(data.username);
          setUserRole(data.role);
          if (data.role === "admin") fetchUsers(token);
          fetchUpcomingShows(token);
        }
      })
      .catch((err) => setError(`Error fetching user data: ${err.message}`));
  }, []);

  const fetchUpcomingShows = (token: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/shows`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setShows(data.shows || []);
        }
      })
      .catch((err) => setError(`Error fetching shows: ${err.message}`));
  };

  const fetchUsers = (token: string) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUsers(data || []);
        }
      })
      .catch((err) => setError(`Error fetching users: ${err.message}`));
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

      <EventList shows={shows} error={error} />
    </div>
  );
};

export default Dashboard;
