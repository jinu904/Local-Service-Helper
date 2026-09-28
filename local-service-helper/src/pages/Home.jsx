import { useEffect, useState } from "react";
import { Link } from "../router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSlider from "../components/HeroSlider";
import ServiceIcon from "../components/ServiceIcon";
import { serviceCards, howItWorks, aboutHighlights } from "../data/homeData";

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    document.title = "Local Service Helper";
  }, []);

  // Fade-in-on-scroll for sections below the hero, mirroring the original script.js
  useEffect(() => {
    const items = document.querySelectorAll("main > section:not(.hero)");
    if (!("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((item) => {
      item.classList.add("reveal-on-scroll");
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Please fill in every field.");
      return;
    }
    setContactSent(true);
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Header />
      <main>
        <HeroSlider />

        <section className="services" id="services">
          <h2>Our Services</h2>
          <p className="services-subtitle">Choose from our range of trusted home services.</p>
          <div className="service-grid">
            {serviceCards.map((card) => (
              <div className="service-card" key={card.slug}>
                <ServiceIcon icon={card.icon} />
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <Link to={`/services/${card.slug}`}>View Professionals →</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="how-it-works" id="how-it-works">
          <h2>How It Works</h2>
          <p>Booking a trusted professional takes just a few simple steps.</p>
          <div className="how-it-works-grid">
            {howItWorks.map((step) => (
              <div className="work-card" key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about" id="about">
          <h2>About Local Service Helper</h2>
          <p>
            Local Service Helper connects you with verified, experienced professionals in your area —
            from plumbers and electricians to painters and cleaners. We make it simple to compare
            ratings, reviews and specialties, then book the right person for the job in just a few
            clicks.
          </p>
          <div className="about-highlights">
            {aboutHighlights.map((item) => (
              <div className="about-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>Have a question or need help finding the right professional? Reach out to us.</p>
            <div className="contact-details">
              <p>
                <strong>Address:</strong> 123 MG Road, Ahmedabad, Gujarat, India
              </p>
              <p>
                <strong>Phone:</strong> +91 98765 43210
              </p>
              <p>
                <strong>Email:</strong> support@localservicehelper.com
              </p>
            </div>
          </div>
          <div className="contact-form">
            <h2>Send a Message</h2>
            <form onSubmit={handleContactSubmit}>
              <input
                type="text"
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                type="email"
                placeholder="Your email"
                value={contactForm.email}
                onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <textarea
                placeholder="Your message"
                value={contactForm.message}
                onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                required
              />
              <button type="submit">Send Message</button>
            </form>
            {contactSent && <p style={{ color: "#2e8b57", marginTop: "10px" }}>Thanks! We'll be in touch shortly.</p>}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
