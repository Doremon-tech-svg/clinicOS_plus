require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const initSqlJs = require('sql.js');
const { Pool } = require('pg');

const IS_POSTGRES = !!process.env.DATABASE_URL;

// POSTGRES INIT
let pgPool = null;
if (IS_POSTGRES) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// SQLITE INIT
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../../hospital.db');

let _db = null;
let _initPromise = null;
let _saveTimeout = null;

function getDb() {
  if (IS_POSTGRES) return null;
  if (!_initPromise) {
    _initPromise = initSqlJs().then(SQL => {
      if (fs.existsSync(DB_PATH)) {
        const filebuffer = fs.readFileSync(DB_PATH);
        _db = new SQL.Database(filebuffer);
      } else {
        _db = new SQL.Database();
        persist();
      }
      return _db;
    });
  }
  return _initPromise;
}

function persist() {
  if (IS_POSTGRES) return;
  if (_saveTimeout) clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => {
    if (_db) {
      const data = _db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    }
  }, 100);
}

// WRAPPER METHODS

function formatPgQuery(sql, params) {
  let pgSql = sql;
  
  // Replace ? with $1, $2, etc.
  let i = 1;
  pgSql = pgSql.replace(/\?/g, () => `$${i++}`);

  // Auto-append RETURNING id for INSERT queries if not present
  if (pgSql.trim().toUpperCase().startsWith('INSERT') && !pgSql.toUpperCase().includes('RETURNING ID')) {
    pgSql += ' RETURNING id';
  }

  // Handle SQLite specific booleans/datetime if needed, but standard SQL mostly works
  return pgSql;
}

async function run(sql, params = []) {
  if (IS_POSTGRES) {
    try {
      const pgSql = formatPgQuery(sql, params);
      const res = await pgPool.query(pgSql, params);
      const lastID = (res.rows && res.rows[0] && res.rows[0].id) ? res.rows[0].id : null;
      return { lastInsertRowid: lastID, changes: res.rowCount };
    } catch (e) {
      if (e.code === 'ENETUNREACH' && e.address && e.address.includes(':')) {
        console.error("\n=======================================================");
        console.error("🚨 CRITICAL DATABASE ERROR 🚨");
        console.error("Render cannot connect to Supabase via IPv6.");
        console.error("You are using the Direct connection string (port 5432).");
        console.error("Please go to Supabase -> Database -> Connection String,");
        console.error("select 'Transaction pooler' (port 6543), and use that URL instead!");
        console.error("=======================================================\n");
      }
      console.error("PG Run Error:", e.message, "\\nQuery:", sql, "\\nParams:", params);
      throw e;
    }
  } else {
    const db = await getDb();
    try {
      db.run(sql, params);
      persist();
      const result = db.exec("SELECT last_insert_rowid()");
      const lastID = result.length && result[0].values.length ? result[0].values[0][0] : null;
      return { lastInsertRowid: lastID, changes: db.getRowsModified() };
    } catch (e) {
      console.error("SQL Run Error:", e.message, "\\nQuery:", sql, "\\nParams:", params);
      throw e;
    }
  }
}

async function get(sql, params = []) {
  if (IS_POSTGRES) {
    try {
      const pgSql = formatPgQuery(sql, params);
      const res = await pgPool.query(pgSql, params);
      return res.rows[0] || null;
    } catch (e) {
      console.error("PG Get Error:", e.message, "\\nQuery:", sql, "\\nParams:", params);
      throw e;
    }
  } else {
    const db = await getDb();
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      let row = null;
      if (stmt.step()) {
        row = stmt.getAsObject();
      }
      stmt.free();
      return row;
    } catch (e) {
      console.error("SQL Get Error:", e.message, "\\nQuery:", sql, "\\nParams:", params);
      throw e;
    }
  }
}

async function all(sql, params = []) {
  if (IS_POSTGRES) {
    try {
      const pgSql = formatPgQuery(sql, params);
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } catch (e) {
      console.error("PG All Error:", e.message, "\\nQuery:", sql, "\\nParams:", params);
      throw e;
    }
  } else {
    const db = await getDb();
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    } catch (e) {
      console.error("SQL All Error:", e.message, "\\nQuery:", sql, "\\nParams:", params);
      throw e;
    }
  }
}

async function exec(sql) {
  if (IS_POSTGRES) {
    try {
      const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const stmt of statements) {
        await pgPool.query(stmt);
      }
    } catch (e) {
      if (e.code === 'ENETUNREACH' && e.address && e.address.includes(':')) {
        console.error("\n=======================================================");
        console.error("🚨 CRITICAL DATABASE ERROR 🚨");
        console.error("Render cannot connect to Supabase via IPv6.");
        console.error("You are using the Direct connection string (port 5432).");
        console.error("Please go to Supabase -> Database -> Connection String,");
        console.error("select 'Transaction pooler' (port 6543), and use that URL instead!");
        console.error("=======================================================\n");
      }
      console.error("PG Exec Error:", e.message, "\\nQuery:", sql);
      throw e;
    }
  } else {
    const db = await getDb();
    try {
      db.exec(sql);
      persist();
    } catch (e) {
      console.error("SQL Exec Error:", e.message, "\\nQuery:", sql);
      throw e;
    }
  }
}

function prepare(sql) {
  return {
    run: (...args) => run(sql, args.flat()),
    get: (...args) => get(sql, args.flat()),
    all: (...args) => all(sql, args.flat()),
  };
}

module.exports = { run, get, all, exec, prepare, IS_POSTGRES };
