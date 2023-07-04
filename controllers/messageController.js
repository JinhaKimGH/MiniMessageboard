const Message = require("../models/message");
const {body, validationResult} = require('express-validator');
const ObjectID = require('mongodb').ObjectId
const Club = require("../models/club");

const asyncHandler = require("express-async-handler");

const unicodeDecode = (text) => {
    const decoded = text.replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
    return decoded;
  };

exports.message_create_get = asyncHandler(async (req, res, next) => {
    const club = await Club.findById(req.params.id).exec();

    if (club === null) {
        // No results.
        const err = new Error("Club not found");
        err.status = 404;
        return next(err);
    } 

    if(req.user) {
        if (club.members.includes(req.user.username)){
            const messages = await Message.find({ "club_id": new ObjectID(req.params.id) }, {text: 1, user: 1, added: 1}).sort({added: -1}).exec();
            res.render("club-page", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, messages: messages ? messages : []});
        } else {
            res.render("club-non-member", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "You are not a member of this club so you can not view the chat log."});
        }
    } else {
        res.render('log-in-form', {title: "Log in to view this club."});
    }
});

exports.message_create_post = [
    body("message", "Message must not be less than three characters.").trim().isLength({min: 3}).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const message = new Message({text: unicodeDecode(req.body.message), user: req.user ? unicodeDecode(req.user.username) : req.user, added: new Date(), club_id: req.params.id});
        const club = await Club.findById(req.params.id).exec();

        if (club === null) {
            // No results.
            const err = new Error("Club not found");
            err.status = 404;
            return next(err);
        } 

        if(!errors.isEmpty()){
            const messages = await Message.find({ "club_id": new ObjectID(req.params.id) }, {text: 1, user: 1, added: 1}).sort({added: -1}).exec();
            res.render("club-page", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, errors: errors.array(), messages: messages ? messages : []});
        } else {
            await message.save();
            res.redirect(`/forum/club/${club._id}`);
        }
    })
]