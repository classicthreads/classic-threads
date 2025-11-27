const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'products.json');
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(DATA_FILE))) fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try { return JSON.parse(raw); } catch (e) { return []; }
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET products
router.get('/products', (req, res) => {
  const data = readData();
  res.json(data);
});

// UPLOAD new product (multipart/form-data: fields: title, desc, price, available)
router.post('/upload', upload.single('image'), (req, res) => {
  const { title = '', desc = '', price = '', available = 'true' } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'Image file is required' });

  const products = readData();
  const id = Date.now().toString();
  const item = {
    id,
    title,
    desc,
    price: price || '0',
    available: available === 'true',
    image: `/uploads/${file.filename}`
  };
  products.unshift(item);
  writeData(products);
  res.json({ success: true, item });
});

// EDIT product (fields: title, desc, price, available) — optional image upload
router.post('/edit/:id', upload.single('image'), (req, res) => {
  const id = req.params.id;
  const { title, desc, price, available } = req.body;
  const file = req.file;

  const products = readData();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  if (title !== undefined) products[idx].title = title;
  if (desc !== undefined) products[idx].desc = desc;
  if (price !== undefined) products[idx].price = price;
  if (available !== undefined) products[idx].available = available === 'true';
  if (file) {
    // delete old file if exists
    try {
      const old = path.join(__dirname, '..', products[idx].image);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    } catch (e) { /* ignore */ }
    products[idx].image = `/uploads/${file.filename}`;
  }

  writeData(products);
  res.json({ success: true, item: products[idx] });
});

// DELETE product
router.delete('/delete/:id', (req, res) => {
  const id = req.params.id;
  let products = readData();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  // remove image file
  try {
    const img = path.join(__dirname, '..', products[idx].image);
    if (fs.existsSync(img)) fs.unlinkSync(img);
  } catch (e) { /* ignore */ }

  const removed = products.splice(idx, 1);
  writeData(products);
  res.json({ success: true, removed: removed[0] });
});

module.exports = router;
