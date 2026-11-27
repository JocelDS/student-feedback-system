const CLASS_BY_STATUS = {
  Pending: 'status-pending',
  Reviewed: 'status-reviewed',
  Resolved: 'status-resolved'
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${CLASS_BY_STATUS[status] || 'status-pending'}`}>{status}</span>;
}