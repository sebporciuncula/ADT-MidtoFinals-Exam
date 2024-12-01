import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import "./Form.css";

const Form = () => {
  const [query, setQuery] = useState("");
  const [searchedMovieList, setSearchedMovieList] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [videos, setVideos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedTab, setSelectedTab] = useState("cast");
  const [selectedCast, setSelectedCast] = useState(null); // New state for selected cast member details
  const navigate = useNavigate();
  let { movieId } = useParams();

  const BEARER_TOKEN =
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YTdiNmUyNGJkNWRkNjhiNmE1ZWFjZjgyNWY3NGY5ZCIsIm5iZiI6MTcyOTI5NzI5Ny4wNzMzNTEsInN1YiI6IjY2MzhlZGM0MmZhZjRkMDEzMGM2NzM3NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ZIX4EF2yAKl6NwhcmhZucxSQi1rJDZiGG80tDd6_9XI";

  const handleSearch = useCallback(() => {
    if (query.trim() === "") return;
    axios({
      method: "get",
      url: `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=1`,
      headers: {
        Accept: "application/json",
        Authorization: BEARER_TOKEN,
      },
    }).then((response) => {
      setSearchedMovieList(response.data.results);
    });
  }, [query]);

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setSearchedMovieList([]);
  };

  const handleSave = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("You must be logged in to save a movie.");
      return;
    }

    if (!selectedMovie) {
      alert("Please search and select a movie.");
      return;
    }

    const data = {
      tmdbId: selectedMovie.id,
      title: selectedMovie.title,
      overview: selectedMovie.overview,
      popularity: selectedMovie.popularity,
      releaseDate: selectedMovie.release_date,
      voteAverage: selectedMovie.vote_average,
      backdropPath: selectedMovie.backdrop_path
        ? `https://image.tmdb.org/t/p/original/${selectedMovie.backdrop_path}`
        : null,
      posterPath: selectedMovie.poster_path
        ? `https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`
        : null,
      isFeatured: 0,
    };

    try {
      await axios.post("/movies", data, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      alert("Movie saved successfully!");
      navigate("/main/movies");
    } catch (error) {
      console.error("Error saving movie:", error);
      alert("Failed to save the movie. Please try again.");
    }
  };

  useEffect(() => {
    if (movieId) {
      axios.get(`/movies/${movieId}`).then((response) => {
        setMovie(response.data);
        const tempData = {
          id: response.data.tmdbId,
          original_title: response.data.title,
          overview: response.data.overview,
          popularity: response.data.popularity,
          poster_path: response.data.posterPath,
          release_date: response.data.releaseDate,
          vote_average: response.data.voteAverage,
        };
        setSelectedMovie(tempData);
      });
    }
  }, [movieId]);

  useEffect(() => {
    if (selectedMovie) {
      axios({
        method: "get",
        url: `https://api.themoviedb.org/3/movie/${selectedMovie.id}/credits`,
        headers: {
          Authorization: BEARER_TOKEN,
        },
      }).then((response) => {
        setCast(response.data.cast);
        setCrew(response.data.crew);
      });

      axios({
        method: "get",
        url: `https://api.themoviedb.org/3/movie/${selectedMovie.id}/videos`,
        headers: {
          Authorization: BEARER_TOKEN,
        },
      }).then((response) => {
        setVideos(
          response.data.results.filter((video) => video.type === "Trailer")
        );
      });

      axios({
        method: "get",
        url: `https://api.themoviedb.org/3/movie/${selectedMovie.id}/images`,
        headers: {
          Authorization: BEARER_TOKEN,
        },
      }).then((response) => {
        setPhotos(response.data.backdrops);
      });
    }
  }, [selectedMovie]);

  const handleCastClick = (castMemberId) => {
    axios({
      method: "get",
      url: `https://api.themoviedb.org/3/person/${castMemberId}`,
      headers: {
        Authorization: BEARER_TOKEN,
      },
    }).then((response) => {
      setSelectedCast(response.data);
    });
  };

  return (
    <div className="form-container">
      {!movieId && <h1>Add a Movie</h1>}

      {!movieId && (
        <div className="search-bar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search for a movie"
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      )}
      {searchedMovieList.length > 0 && !selectedMovie && (
        <div className="search-results-container">
          <table className="search-results-table">
            <thead>
              <tr>
                <th>Movies</th>
                <th>Title</th>
                <th>Release Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {searchedMovieList.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                          : "https://via.placeholder.com/50x75?text=No+Image"
                      }
                      alt={movie.title}
                      className="movie-poster-thumbnail"
                    />
                  </td>
                  <td className="movie-title">{movie.title}</td>
                  <td>{movie.release_date}</td>
                  <td>
                    <button
                      className="select-button"
                      onClick={() => handleSelectMovie(movie)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedMovie && (
        <>
          <div className="movie-header">
            <img
              className="movie-poster"
              src={
                selectedMovie.poster_path
                  ? `https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`
                  : "https://via.placeholder.com/200x300?text=No+Image"
              }
              alt={selectedMovie.original_title || "No Poster Available"}
            />
            <div className="movie-details-container">
              <h2 className="movie-title">{selectedMovie.original_title}</h2>
              <p className="movie-overview">{selectedMovie.overview}</p>
              <div className="details-list">
                <div className="detail-item">
                  Popularity: <span>{selectedMovie.popularity}</span>
                </div>
                <div className="detail-item">
                  Release Date: <span>{selectedMovie.release_date}</span>
                </div>
                <div className="detail-item">
                  Vote Average: <span>{selectedMovie.vote_average} / 10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button
              className={selectedTab === "cast" ? "active-tab" : ""}
              onClick={() => setSelectedTab("cast")}
            >
              Cast
            </button>
            <button
              className={selectedTab === "crew" ? "active-tab" : ""}
              onClick={() => setSelectedTab("crew")}
            >
              Crew
            </button>
            <button
              className={selectedTab === "videos" ? "active-tab" : ""}
              onClick={() => setSelectedTab("videos")}
            >
              Videos
            </button>
            <button
              className={selectedTab === "photos" ? "active-tab" : ""}
              onClick={() => setSelectedTab("photos")}
            >
              Photos
            </button>
          </div>

          <div className="tabs-content">
            {selectedTab === "cast" && (
              <div className="horizontal-scroll">
                <ul className="cast-crew-list">
                  {cast.map((castMember) => (
                    <li
                      key={castMember.id}
                      className="cast-item"
                      onClick={() => handleCastClick(castMember.id)}
                    >
                      {castMember.profile_path ? (
                        <img
                          className="cast-photo"
                          src={`https://image.tmdb.org/t/p/w200${castMember.profile_path}`}
                          alt={castMember.name}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                      <p>{castMember.name}</p>
                      <p className="character">{castMember.character}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTab === "crew" && (
              <div className="horizontal-scroll">
                <ul className="cast-crew-list">
                  {crew.map((crewMember) => (
                    <li key={crewMember.id} className="cast-item">
                      {crewMember.profile_path ? (
                        <img
                          className="cast-photo"
                          src={`https://image.tmdb.org/t/p/w200${crewMember.profile_path}`}
                          alt={crewMember.name}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                      <p>{crewMember.name}</p>
                      <p>{crewMember.job}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTab === "videos" && (
              <div className="videos-list">
                {videos.map((video) => (
                  <div key={video.id} className="video-item">
                    <iframe
                      title={video.name}
                      width="320"
                      height="180"
                      src={`https://www.youtube.com/embed/${video.key}`}
                      allowFullScreen
                    ></iframe>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === "photos" && (
              <div className="photos-list">
                {photos.map((photo) => (
                  <div key={photo.file_path} className="photo-item">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${photo.file_path}`}
                      alt="Movie backdrop"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedCast && selectedTab === "cast" && (
            <div className="cast-detail-modal">
              <div className="cast-detail-container">
                <img
                  src={`https://image.tmdb.org/t/p/w200${selectedCast.profile_path}`}
                  alt={selectedCast.name}
                />
                <div>
                  <h2>{selectedCast.name}</h2>
                  <h4>Information:</h4>
                  <p>{selectedCast.biography || "No info available"}</p>
                </div>
                <button onClick={() => setSelectedCast(null)}>Close</button>
              </div>
            </div>
          )}

          {!movieId && (
            <div className="action-buttons">
              <button onClick={handleSave}>Save Movie</button>
            </div>
          )}
        </>
      )}
      <Outlet />
    </div>
  );
};

export default Form;
