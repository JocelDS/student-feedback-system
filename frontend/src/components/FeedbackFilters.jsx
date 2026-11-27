import { CATEGORIES, STATUSES } from '../api.js';

export default function FeedbackFilters({ filters, onChange, showStatus = false }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const active = Boolean(filters.search || filters.category || filters.status);

  return (
    <div className="filters card">
      <input
        type="search"
        aria-label="Search feedback"
        placeholder="Search by name or message..."
        value={filters.search}
        onChange={set('search')}
        maxLength={100}
      />
      <select aria-label="Filter by category" value={filters.category} onChange={set('category')}>
        <option value="">All categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      {showStatus && (
        <select aria-label="Filter by status" value={filters.status} onChange={set('status')}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
      {active && (
        <button className="btn btn-ghost btn-small" onClick={() => onChange({ search: '', category: '', status: '' })}>
          Clear
        </button>
      )}
    </div>
  );
}