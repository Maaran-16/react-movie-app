import React from "react";

const MovieCard = ({
  movie: { title, vote_average, poster_path, release_date, original_language },
}) => {
  return (
    <div className="movie-card">
      <img
        src={
          poster_path
            ? `http://image.tmdb.org/t/p/w500/${poster_path}`
            : `/no-movie.png`
        }
        alt={title || "Movie Poster"}
      />
      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <img src="star.svg" alt={title} />
            <p> {vote_average ? vote_average.toFixed(1) : "N/A"} </p>
            <span>•</span>
            <p className="lang">{original_language} </p>
            <span>•</span>
            <p className="year">
              {release_date ? new Date(release_date).getFullYear() : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
