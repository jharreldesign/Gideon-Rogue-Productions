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
      console.log('Response Status:', response.status);
      
      if (!response.ok) {
        // If the response is not OK, throw an error
        const data = await response.json();
        console.log('Error Response Data:', data);
        setError(data.error || 'An error occurred during login.');
        return;
      }

      const data = await response.json();
      console.log('Login Success:', data);

      // Assuming your API returns the token like this:
      if (data.token) {
        // Save token to localStorage after login
        localStorage.setItem('token', data.token);
        console.log('Token saved:', data.token); // Log the token
        alert(`Welcome, ${data.user.username}!`);
        router.push('/dashboard'); // Correct path for navigating to the dashboard
      } else {
        setError('Failed to retrieve token from response.');
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
      {/* Pass a default user prop */}
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
