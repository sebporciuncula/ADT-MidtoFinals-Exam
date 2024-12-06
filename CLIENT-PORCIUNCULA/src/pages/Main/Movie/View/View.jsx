import { useEffect, useState } from 'react';
import { useMovieContext } from '../../../../context/MovieContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function View() {
  const { movie, setMovie } = useMovieContext();
  const [castAndCrews, setCastAndCrews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const { movieId } = useParams();
  const navigate = useNavigate();

  const BEARER_TOKEN = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNTg1YWU1ZTA3MzMzZmFhN2Y3M2FmNGQ4MWVhNDRlMCIsIm5iZiI6MTczMjYwNTY1NC42NCwic3ViIjoiNjc0NTc2ZDYwNjQyNGJkZTI3MDRkMTZkIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.ETF-ehpDK5wiUSMmLRQ1sLKE_aC5C4mBiEoh8-7noIM"; // Replace this with your actual token

  useEffect(() => {
    if (movieId) {
      axios
        .get(`/movies/${movieId}`)
        .then((response) => {
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
      axios
        .get(`https://api.themoviedb.org/3/movie/${movie.id}/credits`, {
          headers: { Authorization: BEARER_TOKEN },
        })
        .then((response) => {
          const { cast, crew } = response.data;
          setCastAndCrews({ cast, crew });
        });

      axios
        .get(`https://api.themoviedb.org/3/movie/${movie.id}/videos`, {
          headers: { Authorization: BEARER_TOKEN },
        })
        .then((response) => {
          setVideos(response.data.results);
        });

      axios
        .get(`https://api.themoviedb.org/3/movie/${movie.id}/images`, {
          headers: { Authorization: BEARER_TOKEN },
        })
        .then((response) => {
          setPhotos(response.data.backdrops);
        });
    }
  }, [movie]);

  return (
    <>
      {movie && (
        <div className="movie-detail-container">
          {/* Back Button */}
          <button
            className="back-button"
            onClick={() => navigate(-1)} // Navigate back to the previous page
          >
            &#8592; Back
          </button>

          <div className="movie-header">
            <img
              className="movie-poster"
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/original/${movie.poster_path}`
                  : 'https://via.placeholder.com/200x300?text=No+Image'
              }
              alt={movie.original_title || 'No Poster Available'}
              style={{ width: '150px', height: '225px', objectFit: 'cover' }} // Updated styles to make poster fit
            />
            <div className="movie-details-container">
              <h2 className="movie-title">{movie.original_title}</h2>
              <p className="movie-overview">{movie.overview}</p>
              <div className="details-list">
                <div className="detail-item">
                  Popularity <span>{movie.popularity}</span>
                </div>
                <div className="detail-item">
                  Release Date <span>{movie.release_date}</span>
                </div>
                <div className="detail-item">
                  Vote Average <span>{movie.vote_average} / 10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-separator" />

          {/* Cast & Crew */}
          <div className="tabs-container">
            <h3 className="section-header">Cast & Crew</h3>

            <div className="scroll-section cast-section">
              <table className="cast-crew-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Character/Department</th>
                    <th>Gender</th>
                    <th>Popularity</th>
                    <th>Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {castAndCrews.cast?.map((cast) => (
                    <tr key={cast.id}>
                      <td>{cast.name}</td>
                      <td>{cast.character}</td>
                      <td>{cast.gender === 1 ? 'Female' : cast.gender === 2 ? 'Male' : 'Unknown'}</td>
                      <td>{cast.popularity}</td>
                      <td>
                        {cast.profile_path ? (
                          <img
                            className="cast-photo"
                            src={`https://image.tmdb.org/t/p/w200${cast.profile_path}`}
                            alt={cast.name}
                            style={{ width: '50px', height: '75px', objectFit: 'cover' }} // Resizing cast photo
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {castAndCrews.crew?.map((crew) => (
                    <tr key={crew.id}>
                      <td>{crew.name}</td>
                      <td>{crew.job}</td>
                      <td>{crew.gender === 1 ? 'Female' : crew.gender === 2 ? 'Male' : 'Unknown'}</td>
                      <td>{crew.popularity}</td>
                      <td>
                        {crew.profile_path ? (
                          <img
                            className="cast-photo"
                            src={`https://image.tmdb.org/t/p/w200${crew.profile_path}`}
                            alt={crew.name}
                            style={{ width: '50px', height: '75px', objectFit: 'cover' }} // Resizing crew photo
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section-separator" />

            {/* Videos Table */}
            <h3 className="section-header">Videos</h3>
            <div className="videos-section">
              <table className="videos-table">
                <thead>
                  <tr>
                    <th>Video Name</th>
                    <th>Video Type</th>
                    <th>Language</th>
                    <th>Release Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id}>
                      <td>{video.name}</td>
                      <td>{video.type}</td>
                      <td>{video.iso_639_1}</td>
                      <td>{video.release_date}</td>
                      <td>
                        <button
                          onClick={() => window.open(`https://www.youtube.com/watch?v=${video.key}`, '_blank')}
                        >
                          Watch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="section-separator" />

            {/* Photos */}
            <h3 className="section-header">Photos</h3>
            <div className="horizontal-scroll photos-section">
              {photos.map((photo) => (
                <img
                  key={photo.file_path}
                  src={`https://image.tmdb.org/t/p/original${photo.file_path}`}
                  alt="Movie Scene"
                  className="photo-thumbnail"
                  style={{ width: '250px', height: '150px', objectFit: 'cover' }} // Resizing photo thumbnails to fit
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default View;
