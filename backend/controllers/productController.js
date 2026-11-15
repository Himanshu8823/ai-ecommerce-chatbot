import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsPath = path.join(__dirname, '../data/products.json');

const getProducts = () => JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

export const getAllProducts = (req, res) => {
  try {
    const products = getProducts();
    const { category, search, stockStatus } = req.query;

    let filtered = products;

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (stockStatus) {
      if (stockStatus === 'in-stock') {
        filtered = filtered.filter(p => p.stock > 0);
      } else if (stockStatus === 'out-of-stock') {
        filtered = filtered.filter(p => p.stock === 0);
      }
    }

    res.json({ success: true, count: filtered.length, products: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = (req, res) => {
  try {
    const products = getProducts();
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkProductStock = (req, res) => {
  try {
    const products = getProducts();
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const pincode = req.query.pincode;
    let estimatedDays = product.deliveryEstimate;
    if (pincode) {
      estimatedDays = pincode.startsWith('7') ? '1-2 business days (Express Hub)' : '3-4 business days (Standard)';
    }

    res.json({
      success: true,
      id: product.id,
      name: product.name,
      stock: product.stock,
      status: product.status,
      warehouse: product.warehouse,
      deliveryEstimate: estimatedDays,
      isAvailable: product.stock > 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
