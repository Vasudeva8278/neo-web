import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserCard = ({ onClose }) => {
    const { userid } = useParams();
    const [userdetails, setUserdetails] = useState(null);
    const [showCard, setShowCard] = useState(true);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userdetailsbyid = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/${userid}`);
                setUserdetails(userdetailsbyid.data);
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        }
        fetchUserDetails();
    }, [userid]);

    if (!showCard) return null;

    return (
        <div style={{
            maxWidth: '350px',
            margin: '20px auto',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            background: '#fff',
            position: 'relative',
        }}>
            <button
                onClick={() => { setShowCard(false); if (onClose) onClose(); }}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: '#eee',
                    border: 'none',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 18,
                }}
                aria-label="Close"
            >
                ×
            </button>
            <h3 style={{ marginBottom: 12, fontWeight: 600, fontSize: 20 }}>User Details</h3>
            {userdetails ? (
                <div>
                    <div style={{ marginBottom: 8 }}><strong>Name:</strong> {userdetails.name || '-'}</div>
                    <div style={{ marginBottom: 8 }}><strong>Email:</strong> {userdetails.email || '-'}</div>
                    <div style={{ marginBottom: 8 }}><strong>Role:</strong> {userdetails.role || '-'}</div>
                    {/* Add more fields as needed */}
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    )
}

export default UserCard
