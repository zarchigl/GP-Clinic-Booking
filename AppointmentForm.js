import React, { useState } from "react";

import "./AppointmentForm.css";
 
/**

* Build the API URL defensively:

* - If REACT_APP_APPT_API is a full endpoint (…/dev/book-appointment) → use it as-is

* - If REACT_APP_APPT_API is a stage base (…/dev) → append /book-appointment

* - If not set → use a safe default with /dev/book-appointment

*/

function buildApiUrl() {

  const DEFAULT =

    "https://qwo836tyv1.execute-api.us-east-1.amazonaws.com/dev/book-appointment";
 
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
 
  const [message, setMessage] = useState(null);

  const [messageType, setMessageType] = useState("");

  const [submitting, setSubmitting] = useState(false);
 
  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((f) => ({ ...f, [name]: value }));

    // keep the message visible until submit attempt; remove this line if you prefer immediate clear

    // setMessage(null);

  };
 
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
 
    const requiredFields = [

      "fullName",

      "email",

      "phone",

      "service",

      "date",

      "shift",

      "emergencyName",

      "emergencyPhone",

    ];
 
    const missing = requiredFields.filter((field) => !form[field]?.trim());

    if (missing.length) {

      setMessageType("error");

      setMessage(`Please fill in all required fields: ${missing.join(", ")}`);

      setSubmitting(false);

      return;

    }
 
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
 
    const url = buildApiUrl();

    if (process.env.NODE_ENV !== "production") {

      // helpful when chasing the missing /dev case

      // eslint-disable-next-line no-console

      console.log("POST URL:", url);

    }
 
    try {

      const response = await fetch(url, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Accept: "application/json",

        },

        body: JSON.stringify(payload),

      });
 
      // Be tolerant of non-JSON or empty bodies

      let data = null;

      try {

        data = await response.json();

      } catch {

        data = null;

      }
 
      if (response.ok) {

        setMessageType("success");

        setMessage("✅ Appointment booked successfully!");

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

        setMessageType("error");

        setMessage(`⚠️ ${data?.message || `Request failed (${response.status})`}`);

      }

    } catch (err) {

      // eslint-disable-next-line no-console

      console.error("Network or server error:", err);

      setMessageType("error");

      setMessage("Failed to book appointment. Please try again later.");

    } finally {

      setSubmitting(false);

    }

  };
 
  // Note: this formatter still assumes "2-3" means 2am–3am; switching to 24h values is recommended.

  const formatShift = (shift) => {

    const [start, end] = shift.split("-");

    const formatHour = (h) => (h > 12 ? `${h - 12}pm` : `${h}am`);

    return `${formatHour(parseInt(start, 10))} - ${formatHour(parseInt(end, 10))}`;

  };
 
  return (
<main className="appt-root">
<section className="appt-card">
<header className="appt-header">
<h1 className="appt-title">Appointment Booking Form</h1>
<p className="appt-note">

            By submitting this form, you agree to be contacted regarding your appointment.
</p>
</header>
 
        {message && (
<div className={`appt-message ${messageType}`} role="status" aria-live="polite">

            {message}
</div>

        )}
 
        <form className="appt-form" onSubmit={handleSubmit} noValidate>
<div className="field">
<label htmlFor="fullName">Full Name *</label>
<input

              id="fullName"

              name="fullName"

              type="text"

              value={form.fullName}

              onChange={handleChange}

              required

            />
</div>
 
          <div className="field">
<label htmlFor="email">Email *</label>
<input

              id="email"

              name="email"

              type="email"

              value={form.email}

              onChange={handleChange}

              required

            />
</div>
 
          <div className="field">
<label htmlFor="phone">Contact Number *</label>
<input

              id="phone"

              name="phone"

              type="tel"

              value={form.phone}

              onChange={handleChange}

              required

            />
</div>
 
          <fieldset className="field">
<legend>Service *</legend>

            {["GP Consultation", "Vaccination", "Medical checkup"].map((s) => (
<label key={s}>
<input

                  type="radio"

                  name="service"

                  value={s}

                  checked={form.service === s}

                  onChange={handleChange}

                  required

                />

                {s}
</label>

            ))}
</fieldset>
 
          <div className="field">
<label htmlFor="date">Appointment Date *</label>
<input

              id="date"

              name="date"

              type="date"

              value={form.date}

              onChange={handleChange}

              required

            />
</div>
 
          <fieldset className="field">
<legend>Preferred Time Slot *</legend>

            {["8-9", "9-10", "10-11", "11-12", "2-3", "3-4", "4-5"].map((shift) => (
<label key={shift}>
<input

                  type="radio"

                  name="shift"

                  value={shift}

                  checked={form.shift === shift}

                  onChange={handleChange}

                  required

                />

                {formatShift(shift)}
</label>

            ))}
</fieldset>
 
          <div className="field">
<label htmlFor="emergencyName">Emergency Contact Name *</label>
<input

              id="emergencyName"

              name="emergencyName"

              type="text"

              value={form.emergencyName}

              onChange={handleChange}

              required

            />
</div>
 
          <div className="field">
<label htmlFor="emergencyPhone">Emergency Contact Number *</label>
<input

              id="emergencyPhone"

              name="emergencyPhone"

              type="tel"

              value={form.emergencyPhone}

              onChange={handleChange}

              required

            />
</div>
 
          <div className="field">
<label htmlFor="notes">Additional Information</label>
<textarea

              id="notes"

              name="notes"

              rows={4}

              value={form.notes}

              onChange={handleChange}

            />
</div>
 
          <div className="submit-row">
<button type="submit" className="btn-primary" disabled={submitting}>

              {submitting ? "Submitting…" : "Submit"}
</button>
</div>
</form>
</section>
</main>

  );

}

 

