import { useNavigate } from 'react-router-dom';
import './Home.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import MovieCards from '../../../../components/MovieCards/MovieCards';
import { useMovieContext } from '../../../../context/MovieContext';

const Home = () => {
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [index, setIndex] = useState(0); // Keep track of current featured movie index
  const [searchQuery, setSearchQuery] = useState('');
  const { movieList, setMovieList, setMovie } = useMovieContext();

  const getMovies = (query = '') => {
    // Get the movies from the API or database
    axios
      .get(`/movies?search=${query}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setMovieList(response.data);
        const random = Math.floor(Math.random() * response.data.length);
        setFeaturedMovie(response.data[random]);
      })
      .catch((e) => console.log(e));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    getMovies(searchQuery); // Fetch movies based on the search query
  };

  useEffect(() => {
    getMovies(); // Initially load movies
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (movieList.length) {
        setIndex((prevIndex) => (prevIndex + 1) % movieList.length); // Increment index and loop around
      }
    }, 5000); // Change every 5 seconds for smooth transition

    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, [movieList]);

  useEffect(() => {
    if (movieList.length) {
      setFeaturedMovie(movieList[index]);
    }
  }, [index, movieList]);

  return (
    <div className="main-container">
      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a movie..."
        />
        <button className="search-button" onClick={handleSearch}>Search</button>
      </div>
      {featuredMovie && movieList.length ? (
        <div className="featured-list-container">
          <div
            className="featured-backdrop"
            style={{
              backgroundImage: `url(${
                featuredMovie.backdropPath !==
                'https://image.tmdb.org/t/p/original/undefined'
                  ? featuredMovie.backdropPath
                  : featuredMovie.posterPath
              })`,
            }}
          >
            <span className="featured-movie-title">{featuredMovie.title}</span>
            {/* Dot indicator for the backdrop */}
            <div className="backdrop-indicator">
              <span>...</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="featured-list-container-loader"></div>
      )}
      <div className="list-container">
        {movieList.map((movie) => (
          <MovieCards
            key={movie.id}
            movie={movie}
            onClick={() => {
              // Navigate to the movie details page
              navigate(`/main/view/${movie.id}`);
              setMovie(movie); // Set the selected movie to context
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
