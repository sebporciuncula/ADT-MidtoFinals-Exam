import { Outlet } from "react-router-dom";
import "./Movie.css";

const Movie = () => {
  return (
    <div className="movie-page">
      <h1>Movie Lists</h1>

      <Outlet />
    </div>
  );
};

export default Movie;