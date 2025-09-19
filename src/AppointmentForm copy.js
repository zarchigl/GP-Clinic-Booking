import React, { useState } from "react";
import "./AppointmentForm.css";

function buildApiUrl() {
  const DEFAULT =
    "https://p8f60upw9c.execute-api.us-east-1.amazonaws.com/dev/book-appointment";

  const base = process.env.REACT_APP_APPT_API;
  if (!base) return DEFAULT;

  const cleaned = base.replace(/\/+$/, ""); // strip trailing slash(es)

  if (cleaned.endsWith("/book-appointment")) return cleaned;
  return `${cleaned}/book-appointment`;
}

export default function AppointmentForm() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    service: "",
    date: "",
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
      "shift",
      "emergencyName",
      "emergencyPhone",
    ];

    const missing = required.filter((k) => !form[k]?.trim());
    if (missing.length) {
      alert("Please fill in all required fields.");
      return;
    }

    // Build the payload for your API
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      contactNumber: form.phone.trim(),
      service: form.service,
      appointmentDate: form.date,
      timeSlot: form.shift,
      emergencyName: form.emergencyName.trim(),
      emergencyNumber: form.emergencyPhone.trim(),
      additionalInfo: form.notes?.trim() || "",
    };

    try {
      const url = buildApiUrl();
      console.log("POST URL:", url);

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
        console.log("API response:", data);

        // Reset the form
        setForm({
          fullName: "",
          email: "",
          phone: "",
          service: "",
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
          {/* 1. Full Name */}
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

          {/* 2. Email */}
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

          {/* 3. Contact Number */}
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

          {/* 4. Service (radios) */}
          <fieldset className="field">
            <legend className="label">
              Service <span className="req">*</span>
            </legend>
            <label>
              <input
                type="radio"
                name="service"
                value="GP Consultation"
                checked={form.service === "GP Consultation"}
                onChange={handleChange}
                required
              />
              GP Consultation
            </label>
            <label>
              <input
                type="radio"
                name="service"
                value="Vaccination"
                checked={form.service === "Vaccination"}
                onChange={handleChange}
                required
              />
              Vaccination
            </label>
            <label>
              <input
                type="radio"
                name="service"
                value="Medical checkup"
                checked={form.service === "Medical checkup"}
                onChange={handleChange}
                required
              />
              Medical checkup
            </label>
          </fieldset>

          {/* 5. Appointment Date */}
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

          {/* 6. Preferred shift (radios) */}
          <fieldset className="field">
            <legend className="label">
              Preferred Time Slot <span className="req">*</span>
            </legend>
            {["8-9", "9-10", "10-11", "11-12", "2-3", "3-4", "4-5"].map(
              (slot) => (
                <label key={slot}>
                  <input
                    type="radio"
                    name="shift"
                    value={slot}
                    checked={form.shift === slot}
                    onChange={handleChange}
                    required
                  />
                  {slot}
                </label>
              )
            )}
          </fieldset>

          {/* 7. Emergency Contact Name */}
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

          {/* 8. Emergency Contact Number */}
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

          {/* 9. Additional Information */}
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