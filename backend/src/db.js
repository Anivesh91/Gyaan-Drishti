const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Read a collection (JSON file)
const read = (collection) => {
  const file = path.join(DATA_DIR, `${collection}.json`);
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return []; }
};

// Write a collection
const write = (collection, data) => {
  const file = path.join(DATA_DIR, `${collection}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Find all (with optional filter)
const findAll = (collection, filter = {}) => {
  let data = read(collection);
  return data.filter(item => {
    return Object.keys(filter).every(key => {
      if (typeof filter[key] === "object" && filter[key].$regex) {
        return new RegExp(filter[key].$regex, filter[key].$options || "").test(item[key]);
      }
      return item[key] === filter[key];
    });
  });
};

// Find one
const findOne = (collection, filter) => findAll(collection, filter)[0] || null;

// Find by ID
const findById = (collection, id) => findOne(collection, { _id: id });

// Create
const create = (collection, data) => {
  const items = read(collection);
  const newItem = { ...data, _id: require("uuid").v4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  items.push(newItem);
  write(collection, items);
  return newItem;
};

// Update by ID
const updateById = (collection, id, update) => {
  const items = read(collection);
  const idx = items.findIndex(i => i._id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...update, updatedAt: new Date().toISOString() };
  write(collection, items);
  return items[idx];
};

// Find one and update
const findOneAndUpdate = (collection, filter, update, options = {}) => {
  const items = read(collection);
  let idx = items.findIndex(item => Object.keys(filter).every(k => item[k] === filter[k]));
  if (idx === -1) {
    if (options.upsert) {
      const newItem = { ...filter, ...update, _id: require("uuid").v4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      items.push(newItem);
      write(collection, items);
      return newItem;
    }
    return null;
  }
  items[idx] = { ...items[idx], ...update, updatedAt: new Date().toISOString() };
  write(collection, items);
  return items[idx];
};

// Delete by ID
const deleteById = (collection, id) => {
  const items = read(collection);
  const filtered = items.filter(i => i._id !== id);
  write(collection, filtered);
  return filtered.length < items.length;
};

// Insert many
const insertMany = (collection, docs) => {
  const items = read(collection);
  const newDocs = docs.map(d => ({ ...d, _id: require("uuid").v4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  items.push(...newDocs);
  write(collection, items);
  return newDocs;
};

// Count
const count = (collection, filter = {}) => findAll(collection, filter).length;

module.exports = { findAll, findOne, findById, create, updateById, findOneAndUpdate, deleteById, insertMany, count };
