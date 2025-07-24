import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const res = await fetch(baseUrl + 'register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstname, lastname, password }),
    });

    if (res.status === 201) {
      alert('Registration successful! You can now log in.');
      navigate('/login');
    } else {
      const error = await res.json();
      alert(`Hata: ${error.error}`);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Name" value={firstname} onChange={e => setFirstname(e.target.value)} />
      <input placeholder="Lastname" value={lastname} onChange={e => setLastname(e.target.value)} />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
