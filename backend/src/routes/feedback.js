const express = require('express');
const supabase = require('../supabase');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const CATEGORIES = ['Suggestion', 'Complaint', 'Appreciation', 'General Feedback'];
const STATUSES = ['Pending', 'Reviewed', 'Resolved'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FIELDS = 'id, student_name, category, message, status, created_at';

function validateFeedback(body) {
  const errors = [];
  const name = typeof body.student_name === 'string' ? body.student_name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name) errors.push('student_name is required');
  else if (name.length > 80) errors.push('student_name must be 80 characters or fewer');

  if (!CATEGORIES.includes(body.category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }

  if (!message) errors.push('message is required');
  else if (message.length < 5) errors.push('message must be at least 5 characters');
  else if (message.length > 1000) errors.push('message must be 1000 characters or fewer');

  return { errors, clean: { student_name: name, category: body.category, message } };
}

// GET /api/feedback  (optional filters: ?category= &status= &search=)
router.get('/', async (req, res, next) => {
  try {
    const { category, status, search } = req.query;

    if (category !== undefined && category !== '' && !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(', ')}` });
    }
    if (status !== undefined && status !== '' && !STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
    }

    let query = supabase.from('feedback').select(FIELDS).order('created_at', { ascending: false });
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    if (typeof search === 'string') {
      // Remove characters that have special meaning in the filter syntax
      const term = search.replace(/[,()%*\\"'`]/g, ' ').trim().slice(0, 100);
      if (term) query = query.or(`student_name.ilike.%${term}%,message.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ count: data.length, data });
  } catch (err) {
    next(err);
  }
});

// GET /api/feedback/stats -> totals for the admin dashboard (admin only)
// NOTE: must be declared before "/:id" so "stats" is not treated as an id.
router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('feedback').select('category, status');
    if (error) throw error;

    const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const row of data) {
      if (row.category in byCategory) byCategory[row.category] += 1;
      if (row.status in byStatus) byStatus[row.status] += 1;
    }
    res.status(200).json({ total: data.length, byCategory, byStatus });
  } catch (err) {
    next(err);
  }
});

// POST /api/feedback -> validate and save
router.post('/', async (req, res, next) => {
  try {
    const { errors, clean } = validateFeedback(req.body || {});
    if (errors.length) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    const { data, error } = await supabase.from('feedback').insert(clean).select(FIELDS).single();
    if (error) throw error;
    res.status(201).json({ message: 'Feedback submitted successfully', data });
  } catch (err) {
    next(err);
  }
});

// GET /api/feedback/:id -> one record
router.get('/:id', async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({ error: 'id must be a valid UUID' });
    }
    const { data, error } = await supabase
      .from('feedback')
      .select(FIELDS)
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Feedback not found' });
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/feedback/:id/status -> admin only
router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({ error: 'id must be a valid UUID' });
    }
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'Validation failed',
        details: [`status must be one of: ${STATUSES.join(', ')}`]
      });
    }
    const { data, error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', req.params.id)
      .select(FIELDS);
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.status(200).json({ message: 'Status updated', data: data[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/feedback/:id -> admin only
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(400).json({ error: 'id must be a valid UUID' });
    }
    const { data, error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', req.params.id)
      .select('id');
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    res.status(200).json({ message: 'Feedback deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;