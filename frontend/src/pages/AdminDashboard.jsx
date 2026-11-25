import { useCallback, useEffect, useState } from 'react';
import { deleteFeedback, getFeedback } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate } from '../utils.js';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reviewing, setReviewing] = useState(null);   // record being read
  const [deleting, setDeleting] = useState(null);     // record awaiting delete confirmation
  const [busy, setBusy] = useState(false);

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

  async function confirmDelete() {
    setBusy(true);
    try {
      await deleteFeedback(deleting.id, token);
      setItems((list) => list.filter((f) => f.id !== deleting.id));
      setNotice('Feedback deleted.');
      setDeleting(null);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setNotice('');
      setError(err.message);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }

  const byCategory = items.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <section>
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-sub">Review and manage submitted feedback.</p>

      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="grid grid-4 stats">
        <div className="card stat tint-lavender"><strong>{items.length}</strong><span>Total feedback</span></div>
        <div className="card stat tint-mint"><strong>{byCategory.Appreciation || 0}</strong><span>Appreciation</span></div>
        <div className="card stat tint-sky"><strong>{byCategory.Suggestion || 0}</strong><span>Suggestions</span></div>
        <div className="card stat tint-peach"><strong>{byCategory.Complaint || 0}</strong><span>Complaints</span></div>
      </div>

      {loading ? (
        <Spinner label="Loading feedback..." />
      ) : items.length === 0 ? (
        <div className="empty card"><h3>No feedback to review</h3><p>New submissions will appear here.</p></div>
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Category</th>
                <th>Message</th>
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

      {reviewing && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="review-title" onClick={() => setReviewing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 id="review-title">Feedback from {reviewing.student_name}</h3>
            <p><CategoryBadge category={reviewing.category} /> <small>{formatDate(reviewing.created_at)}</small></p>
            <p className="review-message">{reviewing.message}</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setReviewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

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
