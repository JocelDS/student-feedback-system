import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeedback } from '../api.js';
import CategoryBadge from '../components/CategoryBadge.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import FeedbackFilters from '../components/FeedbackFilters.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import useDebounce from '../useDebounce.js';
import { formatDate } from '../utils.js';

const NO_FILTERS = { search: '', category: '', status: '' };

export default function ViewFeedback() {
  const [filters, setFilters] = useState(NO_FILTERS);
  const debounced = useDebounce(filters, 300);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;   // prevents an old, slower response from overwriting a newer one
    setLoading(true);
    setError('');
    getFeedback(debounced)
      .then(({ data }) => { if (!ignore) setItems(data); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [debounced, reloadKey]);

  const filtering = Boolean(debounced.search || debounced.category);

  return (
    <section>
      <h1 className="page-title">Feedback Wall</h1>
      <p className="page-sub">Recently submitted feedback from students.</p>

      <FeedbackFilters filters={filters} onChange={setFilters} />

      {loading && <Spinner label="Loading feedback..." />}

      {!loading && error && (
        <div className="alert alert-error" role="alert">
          {error} <button className="link-button dark" onClick={() => setReloadKey((k) => k + 1)}>Try again</button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="empty card">
          {filtering ? (
            <>
              <h3>No matching feedback</h3>
              <p>Try a different search or category.</p>
              <button className="btn btn-primary" onClick={() => setFilters(NO_FILTERS)}>Clear filters</button>
            </>
          ) : (
            <>
              <h3>No feedback yet</h3>
              <p>Be the first to share your thoughts.</p>
              <Link to="/submit" className="btn btn-primary">Submit Feedback</Link>
            </>
          )}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-3">
          {items.map((f) => (
            <article key={f.id} className="card feedback-card">
              <div className="feedback-top">
                <span className="badge-row"><CategoryBadge category={f.category} /> <StatusBadge status={f.status} /></span>
                <time dateTime={f.created_at}>{formatDate(f.created_at)}</time>
              </div>
              <p className="feedback-message clamp">{f.message}</p>
              <p className="feedback-author">&mdash; {f.student_name}</p>
              <button className="btn btn-small btn-secondary card-btn" onClick={() => setSelected(f)}>
                View details
              </button>
            </article>
          ))}
        </div>
      )}

      {selected && <DetailsModal item={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}