import React, { useEffect, useRef } from "react";
import { Container } from "../components";
import { Link } from "react-router-dom";

function NotFound() {
  const returnHomeRef = useRef(null);

  useEffect(() => {
    if (returnHomeRef?.current) {
      returnHomeRef?.current?.focus();
    }
  }, []);
  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center px-4 animate-fade-in">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-widest">
          404
        </h1>
        <p className="text-lg md:text-2xl mt-4 text-gray-400 max-w-md">
          Sorry, we couldn’t find the page you were looking for.
        </p>

        <Link
          ref={returnHomeRef}
          to={"/"}
          className="mt-4 bg-accent text-white text-xs sm:text-sm px-3 py-2 rounded-md font-semibold hover:bg-accent/80 focus:bg-accent/80 focus:ring-2 focus:outline-none focus:ring-white"
        >
          Return Home
        </Link>
      </div>
    </Container>
  );
}

export default NotFound;
