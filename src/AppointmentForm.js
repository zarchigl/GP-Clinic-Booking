import React, { useState } from "react";
import "./AppointmentForm.css";

function buildApiUrl() {
  const DEFAULT =
    "https://llbi3z0e1e.execute-api.us-east-1.amazonaws.com/prod/book-appointment";

  const base = process.env.REACT_APP_APPT_API;
  if (!base) return DEFAULT;

  const cleaned = base.replace(/\/+$/, "");
  if (cleaned.endsWith("/book-appointment")) return cleaned;
  return `${cleaned}/book-appointment`;
}

// Generate time slots dynamically
const generateSlots = () => {
  const slots = [];
  // Morning: 8 AM - 12 PM
  for (let h = 8; h < 12; h++) {
    slots.push({ value: `${h} AM`, label: `${h} AM` });
  }
  // Afternoon: 1 PM - 5 PM
  for (let h = 13; h <= 17; h++) {
    const display = `${h - 12} PM`;
    slots.push({ value: display, label: display });
  }
  return slots;
};

const timeSlots = generateSlots();

export default function AppointmentForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    service: "",
    date: "",
    dob : "",
    shift: "",
    emergencyName: "",
    emergencyPhone: "",
    notes: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      "fullName",
      "email",
      "phone",
      "service",
      "date",
      "dob",
      "shift",
      "emergencyName",
      "emergencyPhone",
    ];

    const missing = required.filter((k) => !form[k]?.trim());
    if (missing.length) {
      alert(`Please fill in all required fields: ${missing.join(", ")}`);
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      contactNumber: form.phone.trim(),
      service: form.service,
      appointmentDate: form.date,
      dateOfBirth: form.dob,
      timeSlot: form.shift,
      emergencyName: form.emergencyName.trim(),
      emergencyNumber: form.emergencyPhone.trim(),
      additionalInfo: form.notes?.trim() || "",
    };

    try {
      const url = buildApiUrl();
      console.log("POST URL:", url, payload);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.ok) {
        alert("✅ Appointment booked successfully!");
        setForm({
          fullName: "",
          email: "",
          phone: "",
          service: "",
          dob: "",
          date: "",
          shift: "",
          emergencyName: "",
          emergencyPhone: "",
          notes: "",
        });
      } else {
        alert(`⚠️ ${data?.message || `Request failed (${response.status})`}`);
      }
    } catch (err) {
      console.error("Network or server error:", err);
      alert("Failed to book appointment. Please try again later.");
    }
  };

  return (
    <main className="appt-root">
      <section className="appt-card">
        <header className="appt-header">
          <h1 className="appt-title">Appointment Booking Form</h1>
          <p className="appt-note">
            By submitting this form, you agree to be contacted regarding your
            appointment. We will confirm your appointment within 24 hours.
          </p>
        </header>

        <div className="appt-required">* Required</div>

        <form className="appt-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="field">
            <label className="label" htmlFor="fullName">
              Full Name <span className="req">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="input"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="field">
            <label className="label" htmlFor="email">
              Email Address <span className="req">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Date of Birth */}
          <div className="field">
          <label className="label" htmlFor="dob">
            Date of Birth <span className="req">*</span>
          </label>
          <input
            id="dob"
            name="dob"
            type="date"
            className="input"
            value={form.dob}
            onChange={handleChange}
            required
          />
          </div>

          {/* Contact Number */}
          <div className="field">
            <label className="label" htmlFor="phone">
              Contact Number <span className="req">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Service */}
          <fieldset className="field">
            <legend className="label">
              Service <span className="req">*</span>
            </legend>
            {["GP Consultation", "Vaccination", "Medical checkup"].map(
              (svc) => (
                <label key={svc}>
                  <input
                    type="radio"
                    name="service"
                    value={svc}
                    checked={form.service === svc}
                    onChange={handleChange}
                    required
                  />
                  {svc}
                </label>
              )
            )}
          </fieldset>

          {/* Appointment Date */}
          <div className="field">
            <label className="label" htmlFor="date">
              Appointment Date <span className="req">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="input"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Time Slots */}
          <fieldset className="field">
            <legend className="label">
              Preferred Time Slot <span className="req">*</span>
            </legend>
            {timeSlots.map((slot) => (
              <label key={slot.value}>
                <input
                  type="radio"
                  name="shift"
                  value={slot.value}
                  checked={form.shift === slot.value}
                  onChange={handleChange}
                  required
                />
                {slot.label}
              </label>
            ))}
          </fieldset>

          {/* Emergency Contact */}
          <div className="field">
            <label className="label" htmlFor="emergencyName">
              Emergency Contact Name <span className="req">*</span>
            </label>
            <input
              id="emergencyName"
              name="emergencyName"
              type="text"
              className="input"
              value={form.emergencyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="emergencyPhone">
              Emergency Contact Number <span className="req">*</span>
            </label>
            <input
              id="emergencyPhone"
              name="emergencyPhone"
              type="tel"
              className="input"
              value={form.emergencyPhone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Notes */}
          <div className="field">
            <label className="label" htmlFor="notes">
              Additional Information
            </label>
            <textarea
              id="notes"
              name="notes"
              className="textarea"
              rows={4}
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          {/* Submit */}
          <div className="submit-row">
            <button type="submit" className="btn-primary">
              Submit
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
