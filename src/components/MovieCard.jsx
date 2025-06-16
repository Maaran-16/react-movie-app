import React from "react";

const MovieCard = ({ movie: { title } }) => {
  return (
    <div>
      <p className="text-white"> {title}</p>
    </div>
  );
};

export default MovieCard;
