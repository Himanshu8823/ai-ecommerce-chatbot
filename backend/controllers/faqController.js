import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const faqsPath = path.join(__dirname, '../data/faqs.json');

const getFaqs = () => JSON.parse(fs.readFileSync(faqsPath, 'utf-8'));

export const getAllFaqs = (req, res) => {
  try {
    const faqs = getFaqs();
    const { category, search } = req.query;

    let filtered = faqs;

    if (category && category !== 'All') {
      filtered = filtered.filter(f => f.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(f =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.keywords.some(k => k.toLowerCase().includes(q))
      );
    }

    // Group categories
    const categories = ['All', ...new Set(faqs.map(f => f.category))];

    res.json({
      success: true,
      categories,
      count: filtered.length,
      faqs: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
