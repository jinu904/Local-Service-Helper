import { Link } from "../router";
import { useEffect, useRef, useState } from "react";
import { heroSlides } from "../data/homeData";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const goTo = (index) => {
    setCurrent((index + heroSlides.length) % heroSlides.length);
  };

  const restart = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
  };

  useEffect(() => {
    restart();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleArrow = (direction) => {
    goTo(current + direction);
    restart();
  };

  const handleDot = (index) => {
    goTo(index);
    restart();
  };

  const slide = heroSlides[current];

  return (
    <section className="hero hero-slider-shell" id="hero">
      <div className="hero-slider">
        {heroSlides.map((s, index) => (
          <div
            key={s.title}
            className={`hero-slide${index === current ? " active" : ""}`}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        ))}
      </div>

      <div className="hero-content">
        <p className="hero-small">{slide.label}</p>
        <h2>{slide.title}</h2>
        <p>{slide.description}</p>
        <Link to="/#services" className="hero-button">
          Explore Services
        </Link>
      </div>

      <button
        type="button"
        className="slider-arrow slider-prev"
        aria-label="Previous slide"
        onClick={() => handleArrow(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="slider-arrow slider-next"
        aria-label="Next slide"
        onClick={() => handleArrow(1)}
      >
        ›
      </button>

      <div className="slider-dots">
        {heroSlides.map((s, index) => (
          <button
            key={s.title}
            type="button"
            className={index === current ? "active" : ""}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => handleDot(index)}
          />
        ))}
      </div>
    </section>
  );
}
