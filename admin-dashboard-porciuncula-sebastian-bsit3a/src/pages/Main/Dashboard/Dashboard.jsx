import { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [savedMovies, setSavedMovies] = useState([]);
  const [trendingCategory, setTrendingCategory] = useState("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      setIsLoading(true);

      try {
        const response = await axios.get(`/movies/trending/${trendingCategory}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setTrendingMovies(response.data);
      } catch (error) {
        console.error("Error fetching trending movies", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingMovies();
  }, [trendingCategory, accessToken]);

  useEffect(() => {
    const fetchSavedMovies = async () => {
      try {
        const response = await axios.get("/movies", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setSavedMovies(response.data);
      } catch (error) {
        console.error("Error fetching saved movies", error);
      }
    };

    fetchSavedMovies();
  }, [accessToken]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setTrendingCategory(category);
  };

  // Filter trending movies that are also saved by the user
  const filterTrendingSavedMovies = () =>
    trendingMovies.filter((trendingMovie) =>
      savedMovies.some((savedMovie) => savedMovie.tmdbId === trendingMovie.tmdbId)
    );

  const filteredMovies = filterTrendingSavedMovies().filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Search Section */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for movies..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Trending Movies Section */}
      <section className="movies-section">
        <div className="trending-header">
          <h2>Trending</h2>
          <div className="trending-buttons">
            <button
              className={trendingCategory === "today" ? "active" : ""}
              onClick={() => handleCategoryChange("today")}
            >
              Today
            </button>
            <button
              className={trendingCategory === "week" ? "active" : ""}
              onClick={() => handleCategoryChange("week")}
            >
              This Week
            </button>
            <button
              className={trendingCategory === "month" ? "active" : ""}
              onClick={() => handleCategoryChange("month")}
            >
              This Month
            </button>
          </div>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="movie-cards">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie) => (
                <div className="movie-card" key={movie.tmdbId}>
                  <img src={movie.posterPath} alt={movie.title} />
                  <h3>{movie.title}</h3>
                </div>
              ))
            ) : (
              <p>No movies found.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
