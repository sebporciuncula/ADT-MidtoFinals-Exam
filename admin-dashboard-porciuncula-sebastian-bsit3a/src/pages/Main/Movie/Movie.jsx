import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./Movie.css";

const Movie = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isFormPage = location.pathname.includes("/form");

  return (
    <div className="movie-page">
      <div className="header">
        {isFormPage && (
          <button
            className="back-button-inline"
            onClick={() => navigate("/main/movies")}
          >
            Back
          </button>
        )}
        {!isFormPage && <h1>Movie Lists</h1>}
      </div>

      <Outlet />
    </div>
  );
};

export default Movie;
