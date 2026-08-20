const db = require('../db/index');

async function create({ type='info', title, message='', department=null, target_role='all' }) {
  return db.run(`INSERT INTO notifications (type,title,message,department,target_role) VALUES (?,?,?,?,?)`, [type,title,message,department,target_role]);
}
async function getRecent(limit=20)  { return db.all(`SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?`, [limit]); }
async function markRead(id)         { return db.run(`UPDATE notifications SET read=1 WHERE id=?`, [id]); }
async function markAllRead()        { return db.run(`UPDATE notifications SET read=1 WHERE read=0`); }
async function getUnreadCount()     { const r = await db.get(`SELECT COUNT(*) as c FROM notifications WHERE read=0`); return r?.c || 0; }

module.exports = { create, getRecent, markRead, markAllRead, getUnreadCount };
