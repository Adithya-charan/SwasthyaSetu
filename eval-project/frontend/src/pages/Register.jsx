import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
    const [user, setUser] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (user.password !== user.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (user.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            setError('Invalid email format');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;
        setLoading(true);
        try {
            await authService.register(user);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '80px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>Register for SwasthyaSetu</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>Name:</label>
                    <input type="text" name="name" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Email:</label>
                    <input type="email" name="email" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Password:</label>
                    <input type="password" name="password" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Confirm Password:</label>
                    <input type="password" name="confirmPassword" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
                    {loading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            <p style={{ marginTop: '15px' }}>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
};

export default Register;
