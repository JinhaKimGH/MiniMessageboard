const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ClubSchema = new Schema({
    name: {type: String, required: true},
    desc: {type: String, required: true},
    members: [{type: String, required: true}],
    owner: [{type: String, required: true}],
    requests: [{type: String, required: true}]
});

// Virtual for club's URL
ClubSchema.virtual("url").get(function () {
    return `/forum/club/${this._id}`;
  });

module.exports = mongoose.model("Club", ClubSchema)