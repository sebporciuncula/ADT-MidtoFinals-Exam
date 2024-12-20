import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [savedMovies, setSavedMovies] = useState([]); // All saved movies
  const [filteredMovies, setFilteredMovies] = useState([]); // Filtered movies based on search
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSearchMovie, setExpandedSearchMovie] = useState(null);
  const [videos, setVideos] = useState([]);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchSavedMovies = async () => {
      try {
        const response = await axios.get("/movies", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSavedMovies(response.data);
        setFilteredMovies(response.data); // Initially set filteredMovies to all savedMovies
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching saved movies", error);
      }
    };
    fetchSavedMovies();
  }, [accessToken]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = savedMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMovies(filtered); // Update filteredMovies based on search
    } else {
      setFilteredMovies(savedMovies); // Reset to original savedMovies if no search query
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearchMovieExpand = (movie) => {
    setExpandedSearchMovie(movie);
  };

  const closeExpandedView = () => {
    setExpandedSearchMovie(null);
  };

  const fetchTrailer = (movie) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You need to be logged in to watch trailers.");
      return;
    }

    axios
      .get(`https://api.themoviedb.org/3/movie/${movie.tmdbId}/videos`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setVideos(response.data.results);
      })
      .catch((error) => {
        console.error("Error fetching trailer:", error);
        alert("Failed to fetch trailer. Please try again.");
      });
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      setFilteredMovies(savedMovies); 
    }
  }, [searchQuery, savedMovies]); 

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Welcome to AnyWatch</h1>

      <section className="movies-section">
        <div className="search-bar-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search for a movie..."
          />
        </div>

        <hr className="line-separator" />

        <div className="movie-cards">
          {filteredMovies.map((movie) => (
            <div
              key={movie.tmdbId}
              className="movie-card"
              onClick={() => handleSearchMovieExpand(movie)}
            >
              <img src={movie.posterPath} alt={movie.title} />
              <h3>{movie.title}</h3>
            </div>
          ))}
        </div>

        {expandedSearchMovie && (
          <div className="expanded-movie-view">
            <div className="expanded-poster">
              <img src={expandedSearchMovie.posterPath} alt="Movie Poster" />
            </div>
            <div className="movie-details">
              <h3>{expandedSearchMovie.title}</h3>
              <p>
                <strong>Overview:</strong> {expandedSearchMovie.overview}
              </p>
              <p>
                <strong>Popularity:</strong> {Math.round(expandedSearchMovie.popularity)}
              </p>
              <p>
                <strong>Release Date:</strong> {expandedSearchMovie.releaseDate}
              </p>
              <p>
                <strong>Vote Average:</strong> {expandedSearchMovie.voteAverage}
              </p>
              <div className="expanded-actions">
                <button className="close-expanded-view" onClick={closeExpandedView}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
