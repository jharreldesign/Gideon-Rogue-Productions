import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  username: string;
}

const Dashboard: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSuperuser, setIsSuperuser] = useState<boolean>(false);

  useEffect(() => {
    // Fetch the logged-in user's username and superuser status from the backend
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found');
      return;
    }

    fetch('http://127.0.0.1:5000/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Response data:', data);
        if (data.error) {
          setError(data.error);
        } else {
          setUsername(data.username);
          
          // Check if the response contains the `is_superuser` field
          if (typeof data.is_superuser === 'undefined') {
            setError('Superuser status is not defined');
            return;
          }

          setIsSuperuser(data.is_superuser);  
          console.log('Is superuser:', data.is_superuser);  
          
          // Fetch users if the logged-in user is a superuser
          if (data.is_superuser) {
            fetchUsers(token);
          }
        }
      })
      .catch((err: Error) => setError(`Error fetching data from the backend: ${err.message}`));
  }, []);

  // Function to fetch users if the logged-in user is a superuser
  const fetchUsers = (token: string) => {
    fetch('http://127.0.0.1:5000/auth/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched users:', data); 
        if (data.error) {
          setError(data.error);
        } else {
          if (Array.isArray(data) && data.length > 0) {
            setUsers(data);  
          } else {
            setUsers([]);  
            console.log('No users found');
          }
        }
      })
      .catch((err: Error) => setError(`Error fetching users: ${err.message}`));
  };

  return (
    <div>
      <h1>Dashboard</h1>
      {error && <p>{error}</p>}
      {username && <p>Welcome, {username}!</p>}
      
      {isSuperuser ? (
        <div>
          <h2>User List</h2>
          {users.length > 0 ? (
            <ul>
              {users.map((user) => (
                <li key={user.id}>{user.username}</li>
              ))}
            </ul>
          ) : (
            <p>No users found.</p>
          )}
        </div>
      ) : (
        <p>You do not have access to view users.</p>
      )}
    </div>
  );
};

export default Dashboard;
