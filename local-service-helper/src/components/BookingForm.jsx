import { useState } from "react";
import { FALLBACK_IMAGE } from "../data/servicesData";

const TIME_SLOTS = ["9:00 AM - 11:00 AM", "11:00 AM - 1:00 PM", "2:00 PM - 4:00 PM", "4:00 PM - 6:00 PM"];

// Local calendar date (toISOString() is UTC and can be "yesterday" in India).
const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const emptyForm = {
  service: "",
  name: "",
  phone: "",
  date: "",
  time: "",
  address: "",
  problem: "",
};

export default function BookingForm({ service, selectedProfessional, onBooked }) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedProfessional) {
      alert(`Please select a ${service.roleLabel} first.`);
      return;
    }
    const required = ["service", "name", "phone", "date", "time", "address", "problem"];
    if (required.some((field) => !form[field])) {
      alert("Please complete every booking detail.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setMessage(
      `Booking request sent for ${form.service} with ${selectedProfessional.name} on ${form.date}, ${form.time}. We will contact you shortly.`
    );
    setForm(emptyForm);
    onBooked();
  };

  return (
    <aside className="booking-section" id="booking">
      <div className="booking-content">
        <div className="booking-icon">📅</div>
        <h2>{service.bookingHeading}</h2>
        <p>{service.bookingDesc}</p>

        <div className="selected-professional">
          {selectedProfessional ? (
            <div className="selected-person">
              <img
          referrerPolicy="no-referrer"
                src={selectedProfessional.img}
                alt={selectedProfessional.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div>
                <strong>{selectedProfessional.name}</strong>
                <span>
                  ★ {selectedProfessional.rating} · {selectedProfessional.experience}
                </span>
              </div>
            </div>
          ) : (
            <div className="selected-placeholder">Choose a {service.roleLabel} from the list</div>
          )}
        </div>

        <form className="service-booking-form" onSubmit={handleSubmit}>
          <label>{service.serviceFieldLabel}</label>
          <select value={form.service} onChange={update("service")} required>
            <option value="">Choose a service</option>
            {service.serviceOptions.map((opt) => (
              <option key={opt}>{opt}</option>
            ))}
          </select>

          <label>Full name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={update("name")}
            required
          />

          <label>Phone number</label>
          <input
            type="tel"
            maxLength={10}
            placeholder="Enter 10-digit phone number"
            value={form.phone}
            onChange={update("phone")}
            required
          />

          <label>Preferred date</label>
          <input type="date" min={todayISO()} value={form.date} onChange={update("date")} required />

          <label>Preferred time</label>
          <select value={form.time} onChange={update("time")} required>
            <option value="">Choose a time</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot}>{slot}</option>
            ))}
          </select>

          <label>Address</label>
          <textarea
            rows={3}
            placeholder="Enter your address"
            value={form.address}
            onChange={update("address")}
            required
          />

          <label>{service.problemLabel}</label>
          <textarea
            rows={3}
            placeholder={service.problemPlaceholder}
            value={form.problem}
            onChange={update("problem")}
            required
          />

          <button className="confirm-booking" type="submit">
            Confirm booking
          </button>
        </form>

        {message && <div className="booking-message">{message}</div>}
      </div>
    </aside>
  );
}
