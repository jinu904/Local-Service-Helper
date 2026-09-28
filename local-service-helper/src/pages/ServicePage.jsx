import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProfessionalCard from "../components/ProfessionalCard";
import BookingForm from "../components/BookingForm";
import { services } from "../data/servicesData";

export default function ServicePage({ slug }) {
  const service = services[slug];

  const [selectedId, setSelectedId] = useState(null);
  const [openReviews, setOpenReviews] = useState(() => new Set());

  useEffect(() => {
    if (service) document.title = service.pageTitle;
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

  const selectedProfessional = service.professionals.find((p) => p.id === selectedId) || null;

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
          </div>
          <div className="professionals-layout">
            <div className="professional-list">
              {service.professionals.map((professional) => (
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
