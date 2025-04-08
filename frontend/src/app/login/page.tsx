'use client'; // Required for components using hooks like useState

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Import the frontend client

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // To display errors or success
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    setLoading(true);
    setMessage('');

    console.log('Attempting login with:', email); // Log email being used

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      console.error('Login Error:', error);
      setMessage(`Login Failed: ${error.message}`);
    } else if (data.session) {
      console.log('Login Successful!', data.session);
      // FOR TESTING: Log the token to the console
      console.log('JWT (Access Token):', data.session.access_token);
      setMessage('Login Successful! Check the console for your JWT token.');
      // Later, you would redirect the user or store the session
    } else {
        console.log('Login attempt weird state:', data, error);
        setMessage('Login attempt returned no error and no session.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {message && <p style={{ color: message.startsWith('Login Failed') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}