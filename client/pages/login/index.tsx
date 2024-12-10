import { useState } from 'react';
import { useRouter } from 'next/router';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true); // Start loading

    try {
      const response = await fetch('http://127.0.0.1:5000/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Log the response status and data for debugging
      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        localStorage.setItem('token', data.token);  // Save the token
        alert(`Welcome, ${data.user.username}!`);
        router.push('/dashboard'); // Correct path for navigating to the dashboard
      } else {
        // Handle the case where the response is not ok (e.g., 401 Unauthorized)
        setError(data.error || 'An error occurred during login.');
      }
      
    } catch (err: unknown) {
      // Handle unexpected errors, such as network issues
      if (err instanceof Error) {
        setError(err.message || 'An unexpected error occurred.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '1em' }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '1em' }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '0.5em', margin: '0.5em 0' }}
            required
          />
        </div>
        <div style={{ marginBottom: '1em' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5em', margin: '0.5em 0' }}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button 
          type="submit" 
          style={{ padding: '0.5em 1em' }} 
          disabled={loading} // Disable button when loading
        >
          {loading ? 'Logging in...' : 'Login'} {/* Show loading text */}
        </button>
      </form>
    </div>
  );
};

export default Login;
