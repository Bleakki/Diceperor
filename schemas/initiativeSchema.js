const mongoose = require('mongoose');

const { Schema } = mongoose;
const { CharacterSchema } = require('./characterSchema');


// const CharacterSchema = new Schema({
//   name: { type: String, unique: true },
//   pc: { type: Boolean, default: false },
//   mod: Number,
//   order: Number,
// });


const initiativeSchema = new Schema({
  characters: [CharacterSchema],
  active: { type: Boolean, default: false },
  current: String,
});


module.exports = {
  Initiative: mongoose.model('Initiative', initiativeSchema),
};
