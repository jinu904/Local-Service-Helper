import { useEffect, useState } from "react";
import { Link } from "../router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HeroSlider from "../components/HeroSlider";
import ServiceIcon from "../components/ServiceIcon";
import { serviceCards, howItWorks, aboutHighlights } from "../data/homeData";
import { api } from "../api";

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactSending, setContactSending] = useState(false);

  useEffect(() => {
    document.title = "Fixnear";
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

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Please fill in every field.");
      return;
    }
    setContactSending(true);
    setContactError("");
    setContactSent(false);
    try {
      await api("/contact-messages", { method: "POST", body: JSON.stringify(contactForm) });
      setContactSent(true);
      setContactForm({ name: "", email: "", message: "" });
    } catch (error) {
      setContactError(error.message);
    } finally {
      setContactSending(false);
    }
  };

  return (
    <>
      <Header />
      <main>
        <HeroSlider />

        <section className="services" id="services">
          <div className="section-kicker">WHAT CAN WE HELP WITH?</div>
          <div className="section-heading-row"><div><h2>Everyday help, made simple.</h2><p className="services-subtitle">Choose a service, compare local professionals, then book at a time that works for you.</p></div><span className="section-badge">6 services available</span></div>
          <div className="service-grid">
            {serviceCards.map((card) => (
              <div className="service-card" key={card.slug}>
                <ServiceIcon icon={card.icon} />
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <Link to={`/services/${card.slug}`}><span>Explore service</span> <b>→</b></Link>
              </div>
            ))}
          </div>
        </section>

        <section className="how-it-works" id="how-it-works">
          <div className="section-kicker">HOW IT WORKS</div><h2>From problem to booked in three steps.</h2>
          <p>Skip the calls and guesswork. We keep it simple from start to finish.</p>
          <div className="how-it-works-grid">
            {howItWorks.map((step) => (
              <div className="work-card" key={step.title}>
                <span className="step-number">{step.title.slice(0, 1)}</span>
                <h3>{step.title.slice(3)}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="earning-model" id="earning-model" aria-labelledby="earning-model-title">
          <div className="earning-model-copy">
            <p className="section-kicker">FIXNEAR EARNING MODEL</p>
            <h2 id="earning-model-title">A fair model that grows with every successful job.</h2>
            <p>Fixnear earns only when a service is completed successfully, while professionals can choose tools that help their business grow.</p>
          </div>
          <div className="earning-model-grid">
            <article className="earning-model-card">
              <span className="earning-model-number">01</span>
              <h3>10% success commission</h3>
              <p>A 10% commission fee applies to every service successfully completed through Fixnear. No completed service means no commission.</p>
            </article>
            <article className="earning-model-card professional-plan">
              <span className="earning-model-number">02</span>
              <h3>Professional subscription</h3>
              <p>Service providers can upgrade their profile with a professional subscription designed to help them win more work.</p>
              <ul>
                <li>More qualified leads</li>
                <li>Better visibility in search results</li>
                <li>Profile promotion</li>
                <li>Business analytics</li>
              </ul>
              <Link className="professional-plan-link" to="/register">Join as a professional <b>→</b></Link>
            </article>
          </div>
        </section>
        <section className="about" id="about">
          <div className="section-kicker">WHY FIXNEAR</div><h2>The easy way to get things done at home.</h2>
          <p>
            Fixnear connects you with verified, experienced professionals in your area —
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
                <strong>Address:</strong> Adani University, Adani Shantigram, near Vaishnodevi Circle, Ahmedabad
              </p>
              <p>
                <strong>Phone:</strong> +91 98752 76950
              </p>
              <p>
                <strong>Email:</strong> support@fixnear.com
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
              {contactError && <p className="form-error">{contactError}</p>}
              <button type="submit" disabled={contactSending}>{contactSending ? "Sending…" : "Send Message"}</button>
            </form>
            {contactSent && <p className="contact-success">Thanks! Your message has been saved and our support team will be in touch shortly.</p>}
          </div>
        </section>

        <section className="location-map" aria-labelledby="location-title">
          <div className="map-copy">
            <p className="section-kicker">OUR SERVICE AREA</p>
            <h2 id="location-title">Local help, right around the corner.</h2>
            <p>We currently connect customers with verified professionals across Ahmedabad. Use the map to find our support location.</p>
            <div className="map-address"><span>⌖</span><div><strong>Adani University, Ahmedabad</strong><small>Adani Shantigram, near Vaishnodevi Circle</small></div></div>
          </div>
          <iframe
            title="Fixnear location in Ahmedabad"
            src="https://www.google.com/maps?q=Adani%20University%2C%20Adani%20Shantigram%2C%20near%20Vaishnodevi%20Circle%2C%20Ahmedabad&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}

