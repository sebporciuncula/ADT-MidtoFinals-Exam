import { useEffect, useState } from 'react';
import { useMovieContext } from '../../../../context/MovieContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './View.css';

function View() {
  const { movie, setMovie } = useMovieContext();
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [videos, setVideos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('cast');
  const [selectedCast, setSelectedCast] = useState(null);  // to store selected cast member

  const BEARER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNTg1YWU1ZTA3MzMzZmFhN2Y3M2FmNGQ4MWVhNDRlMCIsIm5iZiI6MTczMjYwNTY1NC42NCwic3ViIjoiNjc0NTc2ZDYwNjQyNGJkZTI3MDRkMTZkIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.ETF-ehpDK5wiUSMmLRQ1sLKE_aC5C4mBiEoh8-7noIM"; 

  useEffect(() => {
    if (movieId) {
      axios.get(`/movies/${movieId}`)
        .then((response) => {
          setMovie(response.data);
          const tempData = {
            id: response.data.tmdbId,
            original_title: response.data.title,
            overview: response.data.overview,
            vote_average: response.data.voteAverage,
            poster_path: response.data.posterPath,
            release_date: response.data.releaseDate,
          };
          setMovie(tempData);
        })
        .catch((error) => {
          console.error('Error fetching movie:', error);
          navigate('/');
        });
    }
  }, [movieId, setMovie, navigate]);

  useEffect(() => {
    if (movie) {
      axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/credits`, {
        headers: { Authorization: BEARER_TOKEN },
      }).then((response) => {
        const { cast, crew } = response.data;
        setCast(cast);
        setCrew(crew);
      });

      axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/videos`, {
        headers: { Authorization: BEARER_TOKEN },
      }).then((response) => {
        setVideos(response.data.results.filter((video) => video.type === "Trailer"));
      });

      axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/images`, {
        headers: { Authorization: BEARER_TOKEN },
      }).then((response) => {
        setPhotos(response.data.backdrops);
      });
    }
  }, [movie]);

  const handleCastClick = (castMemberId) => {
    axios.get(`https://api.themoviedb.org/3/person/${castMemberId}`, {
      headers: { Authorization: BEARER_TOKEN },
    }).then((response) => {
      setSelectedCast(response.data);  // Show additional details of the selected cast
    });
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'cast':
        return (
          <div className="tabs-container">
            <div className="horizontal-scroll cast-section">
              {cast.slice(0, 10).map((castMember) => (
                <div key={castMember.id} className="cast-member" onClick={() => handleCastClick(castMember.id)}>
                  <img
                    className="cast-photo"
                    src={castMember.profile_path ? `https://image.tmdb.org/t/p/w200${castMember.profile_path}` : 'https://via.placeholder.com/200?text=No+Image'}
                    alt={castMember.name}
                  />
                  <div className="cast-info">
                    <h4>{castMember.name}</h4>
                    <p>{castMember.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'crew':
        return (
          <div className="tabs-container">
            <div className="horizontal-scroll crew-section">
              {crew.slice(0, 10).map((crewMember) => (
                <div key={crewMember.id} className="crew-member">
                  <img
                    className="crew-photo"
                    src={crewMember.profile_path ? `https://image.tmdb.org/t/p/w200${crewMember.profile_path}` : 'https://via.placeholder.com/200?text=No+Image'}
                    alt={crewMember.name}
                  />
                  <div className="crew-info">
                    <h4>{crewMember.name}</h4>
                    <p>{crewMember.job}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'photos':
        return (
          <div className="horizontal-scroll photos-section">
            {photos.map((photo) => (
              <img
                key={photo.file_path}
                src={`https://image.tmdb.org/t/p/original${photo.file_path}`}
                alt="Movie Scene"
                className="photo-thumbnail"
              />
            ))}
          </div>
        );
      case 'videos':
        return (
          <div className="videos-section">
            {videos.map((video) => (
              <div key={video.id}>
                <h4>{video.name}</h4>
                <iframe
                  width="100%"
                  height="315"
                  src={`https://www.youtube.com/embed/${video.key}`}
                  title={video.name}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {movie && (
        <div className="movie-detail-container">
          {/* Back Button */}
          <button className="back-button" onClick={() => navigate(-1)}>
            &#8592; Back
          </button>

          <div className="movie-header">
            {/* Movie Poster */}
            <img
              className="movie-poster"
              src={movie.poster_path ? `https://image.tmdb.org/t/p/original/${movie.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}
              alt={movie.original_title || 'No Poster Available'}
            />

            {/* Movie Details */}
            <div className="movie-details-container">
              <h2 className="movie-title">{movie.original_title}</h2>
              <p className="movie-overview">{movie.overview}</p>
              <p className="movie-rating">Rating: {movie.vote_average}</p>
              <p className="movie-release-date">Release Date: {movie.release_date}</p>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="tabs">
            <button onClick={() => setSelectedTab('cast')} className={selectedTab === 'cast' ? 'active-tab' : ''}>Cast</button>
            <button onClick={() => setSelectedTab('crew')} className={selectedTab === 'crew' ? 'active-tab' : ''}>Crew</button>
            <button onClick={() => setSelectedTab('photos')} className={selectedTab === 'photos' ? 'active-tab' : ''}>Photos</button>
            <button onClick={() => setSelectedTab('videos')} className={selectedTab === 'videos' ? 'active-tab' : ''}>Videos</button>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      )}
    </>
  );
}

export default View;
