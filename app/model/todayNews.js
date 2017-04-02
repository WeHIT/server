'use strict';

module.exports = mongoose => {
  const todayNewsSchema = new mongoose.Schema({
    title: { type: String },
    href: { type: String },
    firstImg: { type: String },
    content: { type: String },
    data: { type: String },
    tag: { type: String },
  });

  return mongoose.model('todayNews', todayNewsSchema);
};