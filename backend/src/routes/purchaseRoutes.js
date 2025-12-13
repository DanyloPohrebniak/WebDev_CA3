const express = require('express');
const router = express.Router();
const { createPurchase, getPurchases, checkoutCart } = require('../bookFunctions/handlePurchase');

router.post('/', createPurchase);
router.get('/', getPurchases);
router.post('/checkout', checkoutCart);

module.exports = router;
