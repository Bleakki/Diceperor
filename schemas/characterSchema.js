const mongoose = require('mongoose');

const { Schema } = mongoose;


const CharacterSchema = new Schema({
  name: { type: String, unique: true },
  pc: { type: Boolean, default: false },
  mod: Number,
  order: Number,
  player: String,
});

module.exports = {
  Character: mongoose.model('Character', CharacterSchema),
  CharacterSchema,
};
