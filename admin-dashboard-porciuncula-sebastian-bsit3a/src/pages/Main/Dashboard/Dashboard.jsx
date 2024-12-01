import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [trendingMovies, setTrendingMovies] = useState({
    today: [],
    week: [],
    month: [],
  });
  const [savedMovies, setSavedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("today");
  const [showMovieSelector, setShowMovieSelector] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedTrendingMovie, setExpandedTrendingMovie] = useState(null);
  const [expandedSearchMovie, setExpandedSearchMovie] = useState(null);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchSavedMovies = async () => {
      try {
        const response = await axios.get("/movies", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSavedMovies(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching saved movies", error);
      }
    };
    fetchSavedMovies();
  }, [accessToken]);

  useEffect(() => {
    const savedTrendingMovies = localStorage.getItem("trendingMovies");
    if (savedTrendingMovies) {
      setTrendingMovies(JSON.parse(savedTrendingMovies));
    }
  }, []);

  useEffect(() => {
    if (
      trendingMovies.today.length ||
      trendingMovies.week.length ||
      trendingMovies.month.length
    ) {
      localStorage.setItem("trendingMovies", JSON.stringify(trendingMovies));
    }
  }, [trendingMovies]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowMovieSelector(false);
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
  };

  const handleAddMovieToTrending = () => {
    if (selectedMovie && selectedCategory) {
      setTrendingMovies((prevState) => {
        const updatedState = { ...prevState };
        if (
          !updatedState[selectedCategory].some(
            (m) => m.tmdbId === selectedMovie.tmdbId
          )
        ) {
          updatedState[selectedCategory].push(selectedMovie);
          alert(
            `${selectedMovie.title} is added successfully in trending for ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}.`
          );
        }
        return updatedState;
      });
      setSelectedMovie(null);
      setShowMovieSelector(false);
    }
  };

  const handleRemoveMovieFromTrending = (movie, category) => {
    const confirmRemove = window.confirm(
      `Are you sure you want to remove ${movie.title} from trending for ${category.charAt(0).toUpperCase() + category.slice(1)}?`
    );
    if (confirmRemove) {
      setTrendingMovies((prevState) => {
        const updatedState = { ...prevState };
        updatedState[category] = updatedState[category].filter(
          (m) => m.tmdbId !== movie.tmdbId
        );
        return updatedState;
      });
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    if (searchQuery.trim()) {
      const filteredMovies = savedMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredMovies);
    } else {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleTrendingMovieExpand = (movie) => {
    setExpandedTrendingMovie(movie);
  };

  const handleSearchMovieExpand = (movie) => {
    setExpandedSearchMovie(movie);
  };

  const closeExpandedView = () => {
    setExpandedTrendingMovie(null);
    setExpandedSearchMovie(null);
  };

  const closeSelectedMovie = () => {
    setSelectedMovie(null);
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      setSearchResults([]); 
    }
  }, [searchQuery]);

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
        {isSearching && <p>Loading...</p>}

        {searchQuery && !isSearching && searchResults.length > 0 && (
          <div className="search-results-container">
            <h3>Search Results:</h3>
            <div className="movie-cards">
              {searchResults.map((movie) => (
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
          </div>
        )}

        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="search-results-container">
            <p>No results found.</p>
          </div>
        )}

        <hr className="line-separator" />

        <div className="trending-header">
          <h2>TRENDING</h2>
          <div className="trending-buttons">
            <button
              onClick={() => handleCategoryClick("today")}
              className={selectedCategory === "today" ? "active" : ""}
            >
              Today
            </button>
            <button
              onClick={() => handleCategoryClick("week")}
              className={selectedCategory === "week" ? "active" : ""}
            >
              This Week
            </button>
            <button
              onClick={() => handleCategoryClick("month")}
              className={selectedCategory === "month" ? "active" : ""}
            >
              This Month
            </button>
          </div>
        </div>

        {selectedCategory && (
          <div className="view-trending-section">
            <h3>{`Trending For ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}</h3>
            <div className="movie-cards">
              {trendingMovies[selectedCategory].length > 0 ? (
                trendingMovies[selectedCategory].map((movie) => (
                  <div
                    className="movie-card trending"
                    key={movie.tmdbId}
                    onClick={() => handleTrendingMovieExpand(movie)}
                  >
                    <img src={movie.posterPath} alt={movie.title} />
                    <h3>{movie.title}</h3>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMovieFromTrending(movie, selectedCategory);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p>No movies selected for trending.</p>
              )}
            </div>
            <div className="add-movie-btn-container">
              <button
                className="add-movie-btn"
                onClick={() => setShowMovieSelector((prev) => !prev)}
              >
                Select a Movie to Add
              </button>
            </div>
          </div>
        )}

        {expandedTrendingMovie && (
          <div className="expanded-movie-view">
            <div className="expanded-poster">
              <img src={expandedTrendingMovie.posterPath} alt="Movie Poster" />
            </div>
            <div className="movie-details">
              <h3>{expandedTrendingMovie.title}</h3>
              <p>
                <strong>Overview:</strong> {expandedTrendingMovie.overview}
              </p>
              <p>
                <strong>Popularity:</strong> {Math.round(expandedTrendingMovie.popularity)}
              </p>
              <p>
                <strong>Release Date:</strong> {expandedTrendingMovie.releaseDate}
              </p>
              <p>
                <strong>Vote Average:</strong> {expandedTrendingMovie.voteAverage}
              </p>
              <div className="expanded-actions">
                <button className="close-expanded-view" onClick={closeExpandedView}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

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
                <strong>Popularity:</strong> {expandedSearchMovie.popularity}
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

        {showMovieSelector && (
          <div className="movie-selector-dialog">
            <h3>Select a Movie to Add</h3>
            <div className="movie-grid-scrollable">
              <div className="movie-grid">
                {isSearching && <p>Loading...</p>}
                {!isSearching && !searchQuery &&
                  savedMovies.map((movie) => (
                    <div
                      key={movie.tmdbId}
                      className="movie-card"
                      onClick={() => handleMovieSelect(movie)}
                    >
                      <img src={movie.posterPath} alt={movie.title} />
                      <h3>{movie.title}</h3>
                    </div>
                  ))}
              </div>
            </div>
            {selectedMovie && (
              <div className="expanded-movie-view">
                <div className="expanded-poster">
                  <img src={selectedMovie.posterPath} alt="Movie Poster" />
                </div>
                <div className="movie-details">
                  <h3>{selectedMovie.title}</h3>
                  <p>
                    <strong>Overview:</strong> {selectedMovie.overview}
                  </p>
                  <p>
                    <strong>Popularity:</strong> {selectedMovie.popularity}
                  </p>
                  <p>
                    <strong>Release Date:</strong> {selectedMovie.releaseDate}
                  </p>
                  <p>
                    <strong>Vote Average:</strong> {selectedMovie.voteAverage}
                  </p>
                  <div className="movie-selection-actions">
                    <button onClick={handleAddMovieToTrending}>
                      Add to Trending for{" "}
                      {selectedCategory.charAt(0).toUpperCase() +
                        selectedCategory.slice(1)}
                    </button>
                    <button onClick={closeSelectedMovie}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
