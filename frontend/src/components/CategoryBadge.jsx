const CLASS_BY_CATEGORY = {
  Suggestion: 'badge-suggestion',
  Complaint: 'badge-complaint',
  Appreciation: 'badge-appreciation',
  'General Feedback': 'badge-general'
};

export default function CategoryBadge({ category }) {
  return <span className={`badge ${CLASS_BY_CATEGORY[category] || 'badge-general'}`}>{category}</span>;
}
