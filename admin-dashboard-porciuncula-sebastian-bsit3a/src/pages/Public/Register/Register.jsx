import React, { useState, useRef, useCallback, useEffect } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../utils/hooks/useDebounce';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    contactNo: '',
  });

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isFieldsDirty, setIsFieldsDirty] = useState(false);
  const [status, setStatus] = useState('idle');
  const [debounceState, setDebounceState] = useState(false);

  const refs = {
    email: useRef(),
    password: useRef(),
    firstName: useRef(),
    middleName: useRef(),
    lastName: useRef(),
    contactNo: useRef(),
  };

  const debouncedFormData = useDebounce(formData, 2000);

  const handleShowPassword = useCallback(() => {
    setIsShowPassword((prev) => !prev);
  }, []);

  const handleChange = (e, field) => {
    setIsFieldsDirty(true);
    setDebounceState(false);
    setFormData((prevData) => ({ ...prevData, [field]: e.target.value }));
  };

  const handleRegister = async () => {
    setStatus('loading');

    try {
      const response = await axios.post('/admin/register', { ...formData, role: 'admin' }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });


      localStorage.setItem('accessToken', response.data.access_token);
      navigate('/');

      alert('Admin Account Created Successfully');

      setStatus('idle');
    } catch (error) {
      alert(error.response.data.message);
      setStatus('idle');
    }
  };

  useEffect(() => {
    setDebounceState(true);
  }, [debouncedFormData]);

  return (
    <div className='Register'>
      <div className='main-container'>
        <h3>Register</h3>
        <form>
          <div className='row-group'>
            <div className='form-group'>
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                ref={refs.firstName}
                onChange={(e) => handleChange(e, 'firstName')}
              />
              {debounceState && isFieldsDirty && !formData.firstName && (
                <span className='errors'>This field is required</span>
              )}
            </div>

            <div className='form-group'>
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                ref={refs.lastName}
                onChange={(e) => handleChange(e, 'lastName')}
              />
              {debounceState && isFieldsDirty && !formData.lastName && (
                <span className='errors'>This field is required</span>
              )}
            </div>
          </div>

          <div className='form-group'>
            <label>Middle Name (Optional):</label>
            <input
              type="text"
              name="middleName"
              ref={refs.middleName}
              onChange={(e) => handleChange(e, 'middleName')}
            />
          </div>

          {['contactNo', 'email', 'password'].map((field) => (
            <div key={field} className='form-group'>
              <label>{`${field.charAt(0).toUpperCase() + field.slice(1)}:`}</label>
              <div className='input-container'>
                <input
                  type={field === 'password' && !isShowPassword ? 'password' : 'text'}
                  name={field}
                  ref={refs[field]}
                  onChange={(e) => handleChange(e, field)}
                />
                {field === 'password' && (
                  <div className='show-password' onClick={handleShowPassword}>
                    {isShowPassword ? (
                      <i className="fa fa-eye-slash" aria-hidden="true"></i>
                    ) : (
                      <i className="fa fa-eye" aria-hidden="true"></i>
                    )}
                  </div>
                )}
              </div>
              {debounceState && isFieldsDirty && !formData[field] && (
                <span className='errors'>This field is required</span>
              )}
            </div>
          ))}

          <div className='submit-container'>
            <button
              type='button'
              disabled={status === 'loading'}
              onClick={() => {
                if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
                  setIsFieldsDirty(true);
                  !formData.firstName && refs.firstName.current.focus();
                  !formData.lastName && refs.lastName.current.focus();
                  !formData.email && refs.email.current.focus();
                  !formData.password && refs.password.current.focus();
                  return;
                }
                handleRegister();
              }}
            >
              {status === 'idle' ? 'Register' : 'Loading'}
            </button>
          </div>

          <div className='register-container'>
            <small>Already have an account? <a href='/'>Login</a></small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
