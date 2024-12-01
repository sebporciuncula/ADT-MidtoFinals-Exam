import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Main.css';

function Main() {
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const location = useLocation(); 
  const [activeLink, setActiveLink] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  useEffect(() => {
    if (!accessToken) {
      handleLogout();
    }
  }, [accessToken]);

  useEffect(() => {
   
    if (location.pathname.includes('dashboard')) {
      setActiveLink('dashboard');
    } else if (location.pathname.includes('movies')) {
      setActiveLink('movies');
    }
  }, [location]);

  return (
    <div className="main">
      <div className="container">
        <div className="navigation">
          <ul>
            <li className={activeLink === 'dashboard' ? 'active' : ''}>
              <a href="/main/dashboard">Dashboard</a>
            </li>
            <li className={activeLink === 'movies' ? 'active' : ''}>
              <a href="/main/movies">Movies</a>
            </li>
            <li className="logout">
              <a onClick={handleLogout}>Logout</a>
            </li>
          </ul>
        </div>
        <div className="outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Main;
