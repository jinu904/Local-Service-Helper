import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BookingForm from "../components/BookingForm";
import { api } from "../api";
import { Link } from "../router";
import { services } from "../data/servicesData";

export default function ProviderProfile({ id }) {
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api(`/providers/${id}`).then((record) => { if (active) setProvider(record); }).catch((reason) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, [id]);

  if (error) return <><Header /><main className="provider-page"><p className="form-error">{error}</p><Link to="/#services">← Back to services</Link></main><Footer /></>;
  if (!provider) return <><Header /><main className="provider-page"><p className="empty-state">Loading provider profile…</p></main><Footer /></>;
  const service = services[provider.service_slug];
  const local = service?.professionals.find((item) => item.name === provider.business_name);
  const professional = { id: provider.id, name: provider.business_name, img: provider.photo_data || provider.photo_url || local?.img || "", experience: `${provider.experience_years} Years Experience`, rating: String(provider.rating), specialties: provider.specialties };

  return <><Header /><main className="provider-page"><Link className="profile-back" to={`/services/${provider.service_slug}`}>← Back to {service?.sectionTitle || "providers"}</Link><section className="provider-profile-layout"><article className="provider-profile-card"><img src={professional.img} alt={professional.name} /><div className="provider-profile-info"><span className="profile-service-label">{provider.service_slug.replace("-", " ")}</span><h2>{provider.business_name} <span className="verified">✓</span></h2><p className="provider-city">⌖ {provider.city} · {professional.experience}</p><div className="profile-rating">★ {provider.rating} <small>({provider.review_count} reviews)</small></div><p>{provider.bio || "Verified local professional ready to help."}</p><h3>Specialties</h3><div className="service-tags">{provider.specialties.map((skill) => <span key={skill}>{skill}</span>)}</div><p className="profile-availability">⏱ {provider.availability_note || "Available by appointment"}</p></div></article><BookingForm service={service} selectedProfessional={professional} onBooked={() => {}} /></section><section className="provider-review-section"><h2>Customer reviews</h2>{provider.reviews?.length ? <div className="profile-review-grid">{provider.reviews.map((review, index) => <article key={index}><strong>★ {review.rating}</strong><p>“{review.text}”</p><span>— {review.author}</span></article>)}</div> : <p className="empty-state">No customer reviews yet.</p>}</section></main><Footer /></>;
}
