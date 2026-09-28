import { FALLBACK_IMAGE } from "../data/servicesData";

export default function ProfessionalCard({
  professional,
  roleLabel,
  isSelected,
  reviewsOpen,
  onSelect,
  onToggleReviews,
}) {
  return (
    <article className="professional-card">
      <div className="professional-photo">
        <img
          referrerPolicy="no-referrer"
          src={professional.img}
          alt={professional.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className="professional-info">
        <div className="professional-name">
          <h3>{professional.name}</h3>
          <span className="verified">✓</span>
        </div>
        <p className="experience">{professional.experience}</p>
        <div className="rating">
          <span>★</span>
          <strong>{professional.rating}</strong>
          <button type="button" className="review-link" onClick={onToggleReviews}>
            {professional.reviewsCount}
          </button>
        </div>
        <p className="professional-review">“{professional.quote}”</p>
        <div className="services-label">Specialties:</div>
        <div className="service-tags">
          {professional.specialties.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="professional-actions">
          <button type="button" className="book-professional" onClick={onSelect}>
            {isSelected ? "Selected ✓" : `Book this ${roleLabel}`}
          </button>
          <button type="button" className="view-reviews" onClick={onToggleReviews}>
            View reviews
          </button>
        </div>
        <div className={`reviews-box${reviewsOpen ? " show" : ""}`}>
          {professional.reviews.map((review, index) => (
            <p key={index}>
              ★ {review.rating} — “{review.text}” — {review.author}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
