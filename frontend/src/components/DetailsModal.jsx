import CategoryBadge from './CategoryBadge.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatDate } from '../utils.js';

export default function DetailsModal({ item, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="details-title" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 id="details-title">Feedback from {item.student_name}</h3>
        <p className="details-meta">
          <CategoryBadge category={item.category} /> <StatusBadge status={item.status} />
          <small>{formatDate(item.created_at)}</small>
        </p>
        <p className="review-message">{item.message}</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}