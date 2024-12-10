import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Retrieve the username from localStorage if available
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUsername(parsedData.username); // Set the username state
    }
  }, []);

  return (
    <div style={{ padding: '2em' }}>
      <h1>Welcome to your Dashboard!</h1>
      <p>You have successfully logged in.</p>
      {username && <p>Welcome, {username}!</p>} {/* Display the username */}
    </div>
  );
};

export default Dashboard;
