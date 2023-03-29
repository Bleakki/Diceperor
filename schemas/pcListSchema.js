const mongoose = require('mongoose');

const { Schema } = mongoose;
const { CharacterSchema } = require('./characterSchema');


const pcListSchema = new Schema({
  characters: [CharacterSchema],
});


module.exports = {
  PCList: mongoose.model('PCList', pcListSchema),
};
