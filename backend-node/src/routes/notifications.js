const router = require('express').Router();
const notif  = require('../services/notificationService');
const db     = require('../db/index');

router.get('/', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit)||20;
    res.json({ notifications: await notif.getRecent(limit), unread: await notif.getUnreadCount() });
  } catch(e) { next(e); }
});

router.patch('/read-all', async (req, res, next) => {
  try { await notif.markAllRead(); res.json({ success:true }); } catch(e) { next(e); }
});

router.patch('/:id/read', async (req, res, next) => {
  try { await notif.markRead(req.params.id); res.json({ success:true }); } catch(e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try { const r = await notif.create(req.body); res.json({ success:true, id:r.lastInsertRowid }); } catch(e) { next(e); }
});

module.exports = router;
