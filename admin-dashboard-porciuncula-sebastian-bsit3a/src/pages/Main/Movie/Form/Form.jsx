import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import "./Form.css";

const Form = () => {
  const [query, setQuery] = useState("");
  const [searchedMovieList, setSearchedMovieList] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(undefined);
  const [movie, setMovie] = useState(undefined);
  const [castAndCrews, setCastAndCrews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedCast, setSelectedCast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  let { movieId } = useParams();

  const BEARER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YTdiNmUyNGJkNWRkNjhiNmE1ZWFjZjgyNWY3NGY5ZCIsIm5iZiI6MTcyOTI5NzI5Ny4wNzMzNTEsInN1YiI6IjY2MzhlZGM0MmZhZjRkMDEzMGM2NzM3NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ZIX4EF2yAKl6NwhcmhZucxSQi1rJDZiGG80tDd6_9XI";


  const handleSearch = useCallback(() => {
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
        setCastAndCrews(response.data.cast);
      });

      axios({
        method: "get",
        url: `https://api.themoviedb.org/3/movie/${selectedMovie.id}/videos`,
        headers: {
          Authorization: BEARER_TOKEN,
        },
      }).then((response) => {
        setVideos(response.data.results);
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

  const openCastModal = (cast) => {
    setSelectedCast(cast);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCast(null);
    setIsModalOpen(false);
  };

  return (
    <div className="form-container">
      <h1>{movieId !== undefined ? "Edit " : "Create "} Movie</h1>

      {movieId === undefined && (
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Movie..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button" onClick={handleSearch}>
              Search
            </button>
            <button type="button" onClick={handleSave}>
              Save Movie
            </button>
          </div>
          <div className="search-results">
            <div className="search-grid">
              {searchedMovieList.map((movie) => (
                <div
                  key={movie.id}
                  className="search-item"
                  onClick={() => handleSelectMovie(movie)}
                >
                  {movie.poster_path ? (
                    <img
                      className="search-poster"
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.original_title || movie.title}
                    />
                  ) : (
                    <div className="no-poster">No Poster</div>
                  )}
                  <p className="movie-title">{movie.original_title || movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedMovie && (
        <div className="movie-detail-container">
          <div className="movie-header">
            <img
              className="movie-poster"
              src={`https://image.tmdb.org/t/p/original/${selectedMovie.poster_path}`}
              alt={selectedMovie.original_title}
            />
            <div className="movie-overview">
              <h2>{selectedMovie.original_title}</h2>
              <p>{selectedMovie.overview}</p>
              <div className="movie-details">
                <span>Popularity: {selectedMovie.popularity}</span>
                <span>Release Date: {selectedMovie.release_date}</span>
                <span>Vote Average: {selectedMovie.vote_average}</span>
              </div>
            </div>
          </div>

          <div className="tabs-container">
            <div className="tabs-content">
              <h3>Cast & Crew</h3>
              <div className="horizontal-scroll">
                <ul className="cast-crew-list">
                  {castAndCrews.map((cast) => (
                    <li
                      key={cast.id}
                      className="cast-item"
                      onClick={() => openCastModal(cast)}
                    >
                      {cast.profile_path ? (
                        <img
                          className="cast-photo"
                          src={`https://image.tmdb.org/t/p/w200${cast.profile_path}`}
                          alt={cast.name}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                      <p>{cast.name}</p>
                      <p className="character">{cast.character}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <h3>Videos</h3>
              <div className="horizontal-scroll">
                <div className="videos-container">
                  {videos.map((video) => (
                    <iframe
                      key={video.id}
                      className="video-frame"
                      src={`https://www.youtube.com/embed/${video.key}`}
                      title={video.name}
                      allowFullScreen
                    ></iframe>
                  ))}
                </div>
              </div>
              <h3>Photos</h3>
              <div className="horizontal-scroll">
                <div className="photos-row">
                  {photos.map((photo) => (
                    <img
                      key={photo.file_path}
                      src={`https://image.tmdb.org/t/p/original${photo.file_path}`}
                      alt="Movie Scene"
                      className="photo-thumbnail"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedCast && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2>{selectedCast.name}</h2>
            {selectedCast.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/original${selectedCast.profile_path}`}
                alt={selectedCast.name}
                className="modal-image"
              />
            ) : (
              <div className="no-image">No Image Available</div>
            )}
            <p>Character: {selectedCast.character}</p>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Form;
