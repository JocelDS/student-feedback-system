import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeedback } from '../api.js';
import CategoryBadge from '../components/CategoryBadge.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate } from '../utils.js';

export default function ViewFeedback() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getFeedback();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <section>
      <h1 className="page-title">Feedback Wall</h1>
      <p className="page-sub">Recently submitted feedback from students.</p>

      {loading && <Spinner label="Loading feedback..." />}

      {!loading && error && (
        <div className="alert alert-error" role="alert">
          {error} <button className="link-button dark" onClick={load}>Try again</button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="empty card">
          <h3>No feedback yet</h3>
          <p>Be the first to share your thoughts.</p>
          <Link to="/submit" className="btn btn-primary">Submit Feedback</Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-3">
          {items.map((f) => (
            <article key={f.id} className="card feedback-card">
              <div className="feedback-top">
                <CategoryBadge category={f.category} />
                <time dateTime={f.created_at}>{formatDate(f.created_at)}</time>
              </div>
              <p className="feedback-message">{f.message}</p>
              <p className="feedback-author">&mdash; {f.student_name}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
