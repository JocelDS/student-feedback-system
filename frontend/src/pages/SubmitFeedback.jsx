import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, createFeedback } from '../api.js';

const EMPTY = { student_name: '', category: '', message: '' };

export default function SubmitFeedback() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function validate() {
    const next = {};
    if (!form.student_name.trim()) next.student_name = 'Please enter your name.';
    if (!form.category) next.category = 'Please choose a category.';
    if (form.message.trim().length < 5) next.message = 'Your message must be at least 5 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    setSuccess(false);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createFeedback({
        student_name: form.student_name.trim(),
        category: form.category,
        message: form.message.trim()
      });
      setSuccess(true);
      setForm(EMPTY);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="narrow">
      <h1 className="page-title">Submit Feedback</h1>
      <p className="page-sub">Tell us what is on your mind. All fields are required.</p>

      {success && (
        <div className="alert alert-success" role="status">
          Thank you! Your feedback was submitted successfully.{' '}
          <Link to="/feedback">See it on the feedback wall</Link>.
        </div>
      )}
      {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}

      <form className="card form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="student_name">Student Name</label>
        <input
          id="student_name"
          name="student_name"
          value={form.student_name}
          onChange={update}
          maxLength={80}
          placeholder="e.g. Juan Dela Cruz"
        />
        {errors.student_name && <p className="field-error">{errors.student_name}</p>}

        <label htmlFor="category">Feedback Category</label>
        <select id="category" name="category" value={form.category} onChange={update}>
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="field-error">{errors.category}</p>}

        <label htmlFor="message">Feedback Message</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={update}
          maxLength={1000}
          rows={6}
          placeholder="Write your feedback here..."
        />
        <div className="counter">{form.message.length}/1000</div>
        {errors.message && <p className="field-error">{errors.message}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </section>
  );
}
