import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Main.css';

function Main() {
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');  // Navigate to the login page after logout
  };

  useEffect(() => {
    if (
      accessToken === undefined ||
      accessToken === '' ||
      accessToken === null
    ) {
      navigate('/login');  // If no access token, redirect to login page
    }
  }, [accessToken, navigate]);

  return (
    <div className='Main'>
      <div className='container'>
        <div className='navigation'>
          <ul>
            <li>
              <a onClick={(e) => {
                e.preventDefault();  // Prevent default anchor behavior
                navigate('/'); // Navigate to the home page but prevent reload
              }}>
                Movies
              </a>
            </li>
            {accessToken ? (
              <li className='logout'>
                <a onClick={handleLogout}>Logout</a>  {/* Logout functionality */}
              </li>
            ) : (
              <li className='login'>
                <a onClick={() => navigate('/login')}>Login</a>  {/* Navigate to login page */}
              </li>
            )}
          </ul>
        </div>
        <div className='outlet'>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Main;
