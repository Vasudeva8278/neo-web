import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import bannerImage from "../Assets/Banner.jpg";


const api = axios.create({
  baseURL: "http://http://13.201.64.165:7000/api/users/getalluser", // updated baseURL
});

const NEO_EXPERT_ROLE_ID = "68621581db15fbb9bbd2f836";
const NEO_EXECUTIVE_ROLE_ID = "68621597db15fbb9bbd2f838";
const SUPER_ADMIN_ROLE_ID = "68621581db15fbb9bbd2f839";
const roleOptions = [
  { value: NEO_EXPERT_ROLE_ID, label: 'Neo Expert' },
  { value: NEO_EXECUTIVE_ROLE_ID, label: 'Neo Executive' },
  { value: SUPER_ADMIN_ROLE_ID, label: 'Admin' }
];

const UserManage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRole, setEditRole] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://13.201.64.165:7000/api/users/getalluser');
        setUsers(res.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setEditRole({ ...editRole, [userId]: newRole });
  };

  const handleUpdateUser = async (id) => {
    try {
      const newRole = editRole[id];
      if (!newRole) return;
      const res = await axios.put(`http://13.201.64.165:7000/api/users/update-status/${id}`, { role: newRole });
      setUsers(users.map(user => user._id === id ? { ...user, role: newRole } : user));
      setEditRole({ ...editRole, [id]: undefined });
      toast.success('User role updated successfully!');
    } catch (error) {
      setError(error);
      toast.error('Failed to update user role.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await axios.delete(`http://13.201.64.165:7000/api/users/delete/${id}`);
      setUsers(users.filter(user => user._id !== id));
      toast.success('User deleted successfully!');
    } catch (error) {
      setError(error);
      toast.error('Failed to delete user.');
    }
  };


  

  return (
    <>
    <ToastContainer />
    <div>
      
      
      <div className="mb-4 sm:mb-6 relative">
        <div 
          className="bg-cover bg-center rounded-2xl overflow-hidden border-2 border-white-200 mt-6"
          style={{ backgroundImage: `url(${bannerImage})`, height: '250px' }}
        >
          <div className="flex items-center justify-between p-2 sm:p-8 relative h-full bg-opacity-30">
            {/* Arrows for banner or additional content can go here */}
          </div>
        </div>
      </div>
      <h1>User Management</h1>
      {loading && (
        <div className="overflow-x-auto">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Role</th>
                <th>Delete</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, idx) => (
                <tr key={idx}>
                  <td><Skeleton width={80} /></td>
                  <td><Skeleton width={180} /></td>
                  <td><Skeleton width={100} /></td>
                  <td><Skeleton width={60} /></td>
                  <td><Skeleton width={60} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    
        <div className="overflow-x-auto">
          <table className="equipment-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Role</th>
                <th>Delete</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => user && (u._id !== user._id && u._id !== user.id)).map((u) => {
                const canEdit = true;
                return (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      {editRole[u._id] !== undefined ? (
                        <select
                          value={editRole[u._id]}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value='' disabled>Select new role</option>
                          {roleOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        u.role === NEO_EXPERT_ROLE_ID ? 'Neo Expert' : u.role === NEO_EXECUTIVE_ROLE_ID ? 'Neo Executive' : u.role === SUPER_ADMIN_ROLE_ID ? 'Admin' : 'Admin'
                      )}
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                    </td>
                    <td>
                      {canEdit ? (
                        editRole[u._id] !== undefined ? (
                          <button className="save-btn" onClick={() => handleUpdateUser(u._id)} disabled={!editRole[u._id]}>Save</button>
                        ) : (
                          <button className="edit-btn" onClick={() => setEditRole({ ...editRole, [u._id]: u.role })}>Edit</button>
                        )
                      ) : (
                        <button className="edit-btn" disabled>Edit</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
   
    </div>
    </>
  )
}

export default UserManage;
