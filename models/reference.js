const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  referenceCode: {
    type: String,
    required: true,
    unique: true,
  },
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
});

const  referenceColleciton = mongoose.model('Reference', referenceSchema);

module.exports = referenceColleciton;