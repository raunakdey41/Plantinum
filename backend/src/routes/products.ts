import { Router } from 'express';
import { products } from '../data/products.js';

const router = Router();

router.get('/', (req, res) => {
  let filtered = [...products];
  
  // Example filters (simplistic)
  if (req.query.petSafe === 'true') {
    filtered = filtered.filter(p => p.petSafe);
  }
  
  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // featured
        break;
    }
  }

  res.json({
    totalCount: filtered.length,
    products: filtered
  });
});

export default router;
