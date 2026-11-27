import { useCallback, useEffect, useState } from 'react';
import { deleteFeedback, getFeedback, getStats, STATUSES, updateStatus } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import DetailsModal from '../components/DetailsModal.jsx';
import FeedbackFilters from '../components/FeedbackFilters.jsx';
import Spinner from '../components/Spinner.jsx';
import useDebounce from '../useDebounce.js';
import { formatDate } from '../utils.js';

const NO_FILTERS = { search: '', category: '', status: '' };

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [filters, setFilters] = useState(NO_FILTERS);
  const debounced = useDebounce(filters, 300);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reviewing, setReviewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Statistics always cover ALL records, regardless of the filters above
  const loadStats = useCallback(async () => {
    try {
      setStats(await getStats(token));
    } catch (err) {
      if (err.status === 401) logout();
    }
  }, [token, logout]);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    getFeedback(debounced)
      .then(({ data }) => { if (!ignore) setItems(data); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [debounced]);

  function handleAuthError(err) {
    if (err.status === 401) {
      logout();
      return true;
    }
    return false;
  }

  async function changeStatus(item, status) {
    setUpdatingId(item.id);
    setError('');
    try {
      const { data } = await updateStatus(item.id, status, token);
      setItems((list) => list.map((f) => (f.id === item.id ? data : f)));
      setNotice(`Status updated to ${status}.`);
      loadStats();
    } catch (err) {
      if (!handleAuthError(err)) setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await deleteFeedback(deleting.id, token);
      setItems((list) => list.filter((f) => f.id !== deleting.id));
      setNotice('Feedback deleted.');
      setDeleting(null);
      loadStats();
    } catch (err) {
      if (handleAuthError(err)) return;
      setNotice('');
      setError(err.message);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }

  const val = (n) => (stats ? n : '-');
  const filtering = Boolean(debounced.search || debounced.category || debounced.status);

  return (
    <section>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-sub">Review and manage submitted feedback.</p>

      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="grid grid-4 stats">
        <div className="card stat tint-lavender"><strong>{val(stats?.total)}</strong><span>Total feedback</span></div>
        <div className="card stat tint-mint"><strong>{val(stats?.byCategory.Appreciation)}</strong><span>Appreciation</span></div>
        <div className="card stat tint-sky"><strong>{val(stats?.byCategory.Suggestion)}</strong><span>Suggestions</span></div>
        <div className="card stat tint-peach"><strong>{val(stats?.byCategory.Complaint)}</strong><span>Complaints</span></div>
      </div>
      <div className="grid grid-3 stats">
        <div className="card stat"><strong>{val(stats?.byStatus.Pending)}</strong><span>Pending</span></div>
        <div className="card stat"><strong>{val(stats?.byStatus.Reviewed)}</strong><span>Reviewed</span></div>
        <div className="card stat"><strong>{val(stats?.byStatus.Resolved)}</strong><span>Resolved</span></div>
      </div>

      <FeedbackFilters filters={filters} onChange={setFilters} showStatus />

      {loading ? (
        <Spinner label="Loading feedback..." />
      ) : items.length === 0 ? (
        <div className="empty card">
          <h3>{filtering ? 'No matching feedback' : 'No feedback to review'}</h3>
          <p>{filtering ? 'Try changing or clearing the filters.' : 'New submissions will appear here.'}</p>
        </div>
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Category</th>
                <th>Message</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id}>
                  <td data-label="Student">{f.student_name}</td>
                  <td data-label="Category"><CategoryBadge category={f.category} /></td>
                  <td data-label="Message" className="msg-cell">{f.message}</td>
                  <td data-label="Status">
                    <select
                      className={`status-select status-${f.status.toLowerCase()}`}
                      aria-label={`Status for feedback from ${f.student_name}`}
                      value={f.status}
                      disabled={updatingId === f.id}
                      onChange={(e) => changeStatus(f, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td data-label="Submitted">{formatDate(f.created_at)}</td>
                  <td data-label="Actions" className="actions">
                    <button className="btn btn-small btn-secondary" onClick={() => setReviewing(f)}>Review</button>
                    <button className="btn btn-small btn-danger" onClick={() => setDeleting(f)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewing && <DetailsModal item={reviewing} onClose={() => setReviewing(null)} />}

      {deleting && (
        <ConfirmModal
          title="Delete this feedback?"
          confirmLabel="Yes, delete"
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        >
          <p>
            Feedback from <strong>{deleting.student_name}</strong> will be permanently removed. This action
            cannot be undone.
          </p>
        </ConfirmModal>
      )}
    </section>
  );
}