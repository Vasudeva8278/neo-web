import React, { useContext, useEffect, useState } from "react";
import ChangePassword from "./ChangePassword";
import NeoModal from "../NeoModal";
import axios from "axios";
import {
  createAndUpdateProfile,
  fetchProfile,
} from "../../services/profileApi";
import { ToastContainer, toast } from "react-toastify";
import photo from '../../Assets/general_profile.png';
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileSettings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const initialFormData = {
    userId: "",
    firstName: user && user.name ? user.name : "",
    lastName: "",
    email: user && user.email ? user.email : "",
    mobile: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  };
  const [formData, setFormData] = useState(initialFormData);

  // Fetch initial profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetchProfile(); // Replace with your backend API endpoint
        if (response.profile) {
          const profile = response.profile;
          if (profile.dateOfBirth) {
            profile.dateOfBirth = new Date(profile.dateOfBirth)
              .toISOString()
              .split("T")[0];
          }
          if (profile.profilePic) {
            setImagePreview(profile.profilePic);
          }
          setFormData(profile);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error.message);
      }
    };
    fetchProfileData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required.";
    if (!formData.email.trim()) newErrors.email = "Email address is required.";
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number.";
    }
    if (!formData.gender.trim()) newErrors.gender = "Please select a gender.";
    if (!formData.dateOfBirth.trim())
      newErrors.dateOfBirth = "Date of birth is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "address") setAddressError("");
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleChangePwd = () => {
    setIsModalOpen(true);
  };

  const validateAddress = (address) => {
    // Match format: "Street, City, State, Postal Code, Country"
    //const addressPattern = /^.+,\s*.+,\s*[A-Za-z]{2},\s*\d{6},\s*.+$/;
    const addressPattern = /^.+\s*,\s*.+\s*,\s*[A-Za-z]*\s*,\s*\d{6}\s*,\s*.+$/;
    if (!addressPattern.test(address)) {
      console.log("address validation failed");
      return "Please enter the complete address in the format: Street, City, State, Postal Code, Country.";
    }
    console.log("address validated");
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const error = validateAddress(formData.address);
    if (error) {
      setAddressError(error);
      return;
    }
    try {
      const formDataToSend = new FormData();

      // Append form data fields
      Object.entries(formData).forEach(([key, value]) => {
        console.log(key, " : : ", value);
        if (key === "profilePic" && value instanceof File) {
          console.log(key, " ** : ", value);
          formDataToSend.append(key, value); // Append file
        } else {
          formDataToSend.append(key, value); // Append other data
        }
      });

      const response = await createAndUpdateProfile(formDataToSend); // Replace with your backend API endpoint
      if (response.status === 200 || response.status === 201) {
        toast.success("Profile saved successfully!");
      }
    } catch (error) {
      console.error("Error saving profile data:", error.message);
      toast.error("Failed to save profile data. Please try again.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: file }); // Store the file in formData
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result); // Preview the uploaded image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    document.getElementById("imageUpload").click();
  };

  // Handle Cancel: clear all fields
  const handleCancel = () => {
    setFormData(initialFormData);
    setImagePreview(null);
    setErrors({});
    setAddressError("");
  };

  // Handle Close: navigate to Documents page
  const handleClose = () => {
    navigate("/NeoDocements");
  };

  return (
    <div className='flex flex-col gap-4 bg-white shadow rounded-lg relative'>
      {/* Top right close icon */}
      <button
        className='absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none'
        onClick={handleClose}
        aria-label='Close'
      >
        &times;
      </button>
      <div className='flex justify-between items-center bg-blue-100  p-4 border-red-500'>
        <h2 className='text-xl font-bold text-gray-700'>Profile Settings</h2>
        <div className='flex gap-6'>
          <button
            className='text-sm text-red-600 font-semibold mr-10'
            onClick={handleChangePwd}
          >
            Change Password
          </button>
        </div>
      </div>
      <div className='pl-8 pr-8 mt-4 pt-4'>
        <div className='flex items-center mb-4 '>
          <div className='w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500'>
            {imagePreview ? (
              <img src={imagePreview} alt='Profile' className='w-full h-full' />
            ) : (
              <img src={photo} />
            )}
          </div>
          <button
            className='ml-4 text-sm text-blue-500 hover:underline'
            onClick={handleImageClick}
          >
            Edit Image
          </button>
          <input
            type='file'
            id='imageUpload'
            accept='image/*'
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className='flex flex-col gap-8'>
            <div className='grid grid-cols-2 gap-6 '>
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium text-gray-700'
                >
                  First Name
                </label>
                <input
                  type='text'
                  id='firstName'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='First Name'
                />
                {errors.firstName && (
                  <p className='text-red-500 text-sm mt-2'>
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor='lastName'
                  className='block text-sm font-medium text-gray-700'
                >
                  Last Name
                </label>
                <input
                  type='text'
                  id='lastName'
                  name='lastName'
                  value={formData.lastName}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='Last Name'
                />
                {errors.lastName && (
                  <p className='text-red-500 text-sm mt-2'>{errors.lastName}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-gray-700'
                >
                  Email Address
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  readOnly
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='Email Address'
                />
              </div>
              <div>
                <label
                  htmlFor='mobile'
                  className='block text-sm font-medium text-gray-700'
                >
                  Mobile Number
                </label>
                <input
                  type='tel'
                  id='mobile'
                  name='mobile'
                  value={formData.mobile}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='Mobile Number'
                />
                {errors.mobile && (
                  <p className='text-red-500 text-sm mt-2'>{errors.mobile}</p>
                )}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Gender
              </label>
              <div className='flex items-center gap-4 mt-2'>
                {["Male", "Female", "Other"].map((option) => (
                  <label key={option} className='flex items-center'>
                    <input
                      type='radio'
                      name='gender'
                      value={option.toLowerCase()}
                      checked={formData.gender === option.toLowerCase()}
                      onChange={handleChange}
                      className='text-blue-500 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-gray-700'>{option}</span>
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className='text-red-500 text-sm mt-2'>{errors.gender}</p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div>
                <label
                  htmlFor='dateOfBirth'
                  className='block text-sm font-medium text-gray-700'
                >
                  Date of Birth
                </label>
                <input
                  type='date'
                  id='dateOfBirth'
                  name='dateOfBirth'
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                />
                {errors.dateOfBirth && (
                  <p className='text-red-500 text-sm mt-2'>
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor='address'
                  className='block text-sm font-medium text-gray-700'
                >
                  Address
                </label>
                <input
                  type='text'
                  id='address'
                  name='address'
                  value={formData.address}
                  onChange={handleChange}
                  className='mt-2 h-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
                  placeholder='123 Main St, Springfield, IL, 62704, USA'
                />
                <span>
                  {errors.address && (
                    <p className='text-red-500 text-sm mt-2'>
                      {errors.address}
                    </p>
                  )}

                  {addressError && (
                    <p className='text-red-500 text-sm mt-2'>{addressError}</p>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className='flex gap-4 mt-8'>
            <button
              type='submit'
              className='bg-blue-500 text-white px-6 py-2 rounded-lg font-medium justify-center'
            >
              Save Changes
            </button>
            <button
              type='button'
              className='bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300'
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type='button'
              className='bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300'
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </form>
        <ToastContainer />
        <NeoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ChangePassword onClose={() => setIsModalOpen(false)} />
        </NeoModal>
      </div>
    </div>
  );
};

export default ProfileSettings;
