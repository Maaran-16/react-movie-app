import "./App.css";
import React, { useEffect, useState } from "react";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const App = () => {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [trendingMovies, setTrendingMovies] = useState([]);

  // The Movie Database API
  const API_BASE_URL = "https://api.themoviedb.org/3";
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  // Function to fetch movies based on search term or default to popular movies

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      if (data.response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies.");
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);
      if (query && data.results.length > 0) {
        // If a search term is provided and movies are found, update the search count
        await updateSearchCount(query, data.results[0]);
        console.log("Search count updated successfully");
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setErrorMessage("Failed to fetch movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  // Fetch trending movies on initial load
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      if (movies && movies.length > 0) {
        setTrendingMovies(movies);
      } else {
        console.log("No trending movies found or empty response");
        setTrendingMovies([]);
      }
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      setTrendingMovies([]);
    }
  };

  // Debounce the search term to avoid too many API calls
  // This will wait for 500ms after the last change to searchTerm before updating debouncedSearchTerm

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    // Load trending movies on initial load
    loadTrendingMovies();
  }, []);
  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
          <header>
            <img src="./hero.png" alt="Hero Banner" />
            <h1>
              Find <span className="text-gradient">Movies</span> You'll Enjoy
              Without the Hassle
            </h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          <section className="trending">
            <h2>Trending Movies</h2>

            {trendingMovies && trendingMovies.length > 0 ? (
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img
                      src={movie.poster_url}
                      alt={movie.title || "Movie poster"}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "path-to-default-poster.jpg";
                      }}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-trending text-white py-5">
                No trending movies available. Try searching for movies first.
              </p>
            )}
          </section>

          <section className="all-movies relative">
            <h2 className="mt-[20px]">All Movies</h2>
            {isloading ? (
              <Spinner className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2" />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList && movieList.length > 0 ? (
                  movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))
                ) : (
                  <p className="text-white">No movies found.</p>
                )}
              </ul>
            )}

            {errorMessage && (
              <p className="error-message text-red-500">{errorMessage}</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default App;
