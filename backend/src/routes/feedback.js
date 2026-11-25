const express = require('express');
const supabase = require('../supabase');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const CATEGORIES = ['Suggestion', 'Complaint', 'Appreciation', 'General Feedback'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

// GET /api/feedback -> all feedback, newest first
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('id, student_name, category, message, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ count: data.length, data });
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
    const { data, error } = await supabase
      .from('feedback')
      .insert(clean)
      .select('id, student_name, category, message, created_at')
      .single();
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
      .select('id, student_name, category, message, created_at')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Feedback not found' });
    res.status(200).json({ data });
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
