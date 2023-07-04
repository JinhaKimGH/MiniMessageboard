const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    text: {type: String, required: true},
    user:  {type: String, required: true},
    added: {type: Date, requried: true},
    club_id: {type: Schema.Types.ObjectId, ref: "Club", required: true}
});

MessageSchema.virtual("date_formatted").get(function () {
    return DateTime.fromJSDate(this.added).toLocaleString(DateTime.DATETIME_MED);
})

module.exports = mongoose.model("Message", MessageSchema)