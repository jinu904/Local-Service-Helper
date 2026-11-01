import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProfessionalCard from "../components/ProfessionalCard";
import BookingForm from "../components/BookingForm";
import { services } from "../data/servicesData";
import { api } from "../api";
import { navigate } from "../router";

export default function ServicePage({ slug }) {
  const service = services[slug];

  const [selectedId, setSelectedId] = useState(null);
  const [openReviews, setOpenReviews] = useState(() => new Set());
  const [providers, setProviders] = useState([]);
  const [providerError, setProviderError] = useState("");
  const [issue, setIssue] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationError, setRecommendationError] = useState("");
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  useEffect(() => {
    if (service) document.title = service.pageTitle;
  }, [service]);

  useEffect(() => {
    if (!service) return;
    let active = true;
    api(`/providers?service=${service.slug}`)
      .then((rows) => {
        if (!active) return;
        const formatted = rows.map((row) => {
          const local = service.professionals.find((person) => person.name === row.business_name);
          return {
            id: row.id, name: row.business_name,
            img: row.photo_data || row.photo_url || local?.img || "",
            experience: `${row.experience_years} Years Experience`, rating: String(row.rating), reviewsCount: `${row.review_count} reviews`,
            quote: row.reviews?.[0]?.text || local?.quote || "Verified local professional ready to help.", specialties: row.specialties,
            reviews: row.reviews?.length ? row.reviews : (local?.reviews || []),
          };
        });
        setProviders(formatted);
      })
      .catch(() => { if (active) setProviderError("Provider list is temporarily unavailable. Start the backend to see live profiles."); });
    return () => { active = false; };
  }, [service]);

  if (!service) {
    return (
      <>
        <Header />
        <main>
          <section className="service-hero">
            <div className="service-hero-content">
              <h2>Service not found</h2>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const toggleReviews = (id) => {
    setOpenReviews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const findBestMatch = async (event) => {
    event.preventDefault();
    setRecommendationError("");
    setRecommendationLoading(true);
    try {
      const result = await api("/recommendations", { method: "POST", body: JSON.stringify({ serviceSlug: service.slug, problem: issue }) });
      setRecommendations(result.recommendations);
    } catch (error) { setRecommendationError(error.message); } finally { setRecommendationLoading(false); }
  };

  const visibleProfessionals = providers.length ? providers : service.professionals;
  const selectedProfessional = visibleProfessionals.find((p) => p.id === selectedId) || null;

  return (
    <>
      <Header />
      <main>
        <section className="service-hero">
          <div className="service-hero-content">
            <span>{service.heroLabel}</span>
            <h2>{service.heroTitle}</h2>
            <p>{service.heroDesc}</p>
          </div>
        </section>

        <section className="professionals-section">
          <div className="professionals-heading">
            <h2>{service.sectionTitle}</h2>
            <p>{service.sectionDesc}</p>
            {providerError && <p className="form-error">{providerError}</p>}
          </div>
          <section className="smart-match" aria-label="Provider recommendation">
            <div><span className="smart-match-label">SMART ML MATCH</span><h3>Tell us what needs fixing.</h3><p>We combine specialty matching with a trained provider-suitability model, ratings, and review history.</p></div>
            <form onSubmit={findBestMatch}><input value={issue} onChange={(event) => setIssue(event.target.value)} placeholder={service.problemPlaceholder} aria-label="Describe your problem" /><button disabled={recommendationLoading}>{recommendationLoading ? "Finding matches…" : "Find best matches"}</button></form>
            {recommendationError && <p className="form-error">{recommendationError}</p>}
            {!!recommendations.length && <div className="match-results">{recommendations.map((match, index) => <button type="button" key={match.id} className="match-card" onClick={() => navigate(`/providers/${match.id}`)}><span className="match-rank">#{index + 1}</span><span><strong>{match.business_name}</strong><small>{match.reason}</small></span><span className="match-rating">★ {match.rating}<small>{match.review_count} reviews · {match.score}% match · {match.ml_suitability}% ML fit</small></span></button>)}</div>}
          </section>
          <div className="professionals-layout">
            <div className="professional-list">
              {visibleProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  roleLabel={service.roleLabel}
                  isSelected={selectedId === professional.id}
                  reviewsOpen={openReviews.has(professional.id)}
                  onSelect={() => setSelectedId(professional.id)}
                  onToggleReviews={() => toggleReviews(professional.id)}
                />
              ))}
            </div>

            <BookingForm
              service={service}
              selectedProfessional={selectedProfessional}
              onBooked={() => setSelectedId(null)}
            />
          </div>
        </section>

        {service.customerReviews && (
          <section className="customer-reviews">
            <div className="reviews-heading">
              <h2>What Our Customers Say</h2>
              <p>Feedback from customers who booked our {service.roleLabel}s.</p>
            </div>
            <div className="customer-review-grid">
              {service.customerReviews.map((review, index) => (
                <article className="customer-review-card" key={index}>
                  <div className="customer-rating">★ {review.rating}</div>
                  <p>“{review.text}”</p>
                  <strong>— {review.author}</strong>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
