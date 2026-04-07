import React, { useEffect, useState } from 'react';
import api from '../services/api';
import authService from '../services/authService';
import { NavLink } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await api.get('/appointments');
                setAppointments(response.data.appointments);
            } catch (err) {
                console.error('Error fetching appointments:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const logout = () => {
        authService.logout();
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar Navigation */}
            <aside style={{ width: '250px', background: '#f4f4f4', padding: '20px', borderRight: '1px solid #ddd' }}>
                <h3>SwasthyaSetu</h3>
                <nav>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li><NavLink to="/dashboard" style={{ textDecoration: 'none', color: '#333', display: 'block', padding: '10px 0' }}>Dashboard</NavLink></li>
                        <li><NavLink to="/appointments/new" style={{ textDecoration: 'none', color: '#333', display: 'block', padding: '10px 0' }}>New Appointment</NavLink></li>
                        <li><NavLink to="/profile" style={{ textDecoration: 'none', color: '#333', display: 'block', padding: '10px 0' }}>Profile</NavLink></li>
                        <li><button onClick={logout} style={{ width: '100%', padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '50px' }}>Logout</button></li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, padding: '40px' }}>
                <header>
                    <h1>Welcome, {user?.name}!</h1>
                    <p style={{ color: '#666' }}>Role: {user?.role}</p>
                </header>

                <section style={{ marginTop: '30px' }}>
                    <h2>Recent Appointments</h2>
                    {loading ? <p>Loading appointments...</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
                            {appointments.length === 0 ? <p>No appointments found. <NavLink to="/appointments/new">Book one now</NavLink></p> : (
                                appointments.map(appt => (
                                    <div key={appt.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{appt.doctor_name}</h4>
                                        <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#666' }}>{new Date(appt.appointment_date).toLocaleDateString()}</p>
                                        <p style={{ margin: 0, fontSize: '0.9em' }}>{appt.reason}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
