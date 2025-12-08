const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book:   { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity:      { type: Number, required: true, min: 1, max: 5 },
    pricePerUnit:  { type: Number, required: true },
    finalPrice:    { type: Number, required: true }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Purchase', purchaseSchema, 'purchases');