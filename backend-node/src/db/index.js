require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');
const initSqlJs = require('sql.js');

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '../../hospital.db');

let _db = null;
let _initPromise = null;
let _saveTimeout = null;

function getDb() {
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
  if (_saveTimeout) clearTimeout(_saveTimeout);
  _saveTimeout = setTimeout(() => {
    if (_db) {
      const data = _db.export();
      fs.writeFileSync(DB_PATH, Buffer.from(data));
    }
  }, 100);
}

async function run(sql, params = []) {
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

async function get(sql, params = []) {
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

async function all(sql, params = []) {
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

async function exec(sql) {
  const db = await getDb();
  try {
    db.exec(sql);
    persist();
  } catch (e) {
    console.error("SQL Exec Error:", e.message, "\\nQuery:", sql);
    throw e;
  }
}

function prepare(sql) {
  return {
    run: (...args) => run(sql, args.flat()),
    get: (...args) => get(sql, args.flat()),
    all: (...args) => all(sql, args.flat()),
  };
}

module.exports = { run, get, all, exec, prepare };
