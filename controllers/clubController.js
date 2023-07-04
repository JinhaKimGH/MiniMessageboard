const Message = require('../models/message');
const User = require('../models/user')
const Club = require("../models/club")
const ObjectID = require('mongodb').ObjectId
const {body, validationResult} = require('express-validator');

const asyncHandler = require('express-async-handler');

const unicodeDecode = (text) => {
    const decoded = text.replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
    return decoded;
  };

exports.club_list = asyncHandler(async (req, res, next) => {
    const allClubs = await Club.find({}).sort({name: 1}).exec();
    res.render("index", {title: "Mini Messageboard", clubs: allClubs, user: req.user ? unicodeDecode(req.user.username) : req.user})
})

exports.club_create_get = asyncHandler(async (req, res, next) => {
    if(req.user){
        res.render('club-form', {title: "Create New Club", user: req.user ? unicodeDecode(req.user.username) : req.user});
    }

    else{
        res.render('log-in-form', {title: "Log in before creating a club.", user: req.user ? unicodeDecode(req.user.username) : req.user});
    }
});

exports.club_create_post = [
    body("name", "Name must not be less than four characters.").trim().isLength({min: 4}).escape(),
    body("description", "Description must not be less than ten characters.").trim().isLength({min: 10}).escape(),

    
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const checkClub = await Club.findOne({name: unicodeDecode(req.body.name)});
        
        if (!checkClub){
            const club = new Club({name: unicodeDecode(req.body.name), desc: unicodeDecode(req.body.description), members: [req.user.username], owner: [req.user.username], messages: [], requests: []})
            
            if(!errors.isEmpty()){
                res.render("club-form", {title: "Create New Club", user: req.user ? unicodeDecode(req.user.username) : req.user, errors: errors.array()});
            } else{
                await club.save();
                res.redirect('/forum');
            }
        } else {
            res.render('club-form', {title: "Create New Club", user: req.user ? unicodeDecode(req.user.username) : req.user, errors: [{msg: "That name is already associated with a club."}]});
        }
    })
]

exports.club_add_member_get = asyncHandler( async (req, res, next ) => {
    const club = await Club.findById(req.params.id).exec();

    if (club === null) {
        // No results.
        const err = new Error("Club not found");
        err.status = 404;
        return next(err);
    } 

    if (req.user) {
        if (club.owner.includes(req.user.username)) {
            res.render("club-add-remove-member-form", {title: "Add Member", club: club, user: req.user ? unicodeDecode(req.user.username) : req.user});
        } else {
            res.render("club-non-owner", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "Only a club's owner can add members."});
        }
    } else {
        res.render("club-non-member", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "Only a club's owner can add members."});
    }
});

exports.club_add_member_post = [
    body("username", "This is not a valid username").trim().isLength({min: 3}).escape(),
    asyncHandler( async (req, res, next) => {
        const club = await Club.findById(req.params.id).exec();

        if (club === null) {
            // No results.
            const err = new Error("Club not found");
            err.status = 404;
            return next(err);
        } 

        const checkUser = await User.findOne({ username: unicodeDecode(req.body.username) });

        if (!checkUser){
            res.render("club-add-remove-member-form", {title: "Add Member", club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, errors: [{msg: "User does not exist."}]})
        } else if (club.members.includes(unicodeDecode(req.body.username))){
            res.render("club-add-remove-member-form", {title: "Add Member", club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, errors: [{msg: "User is already in the club."}]})
        } else{
            await Club.findOneAndUpdate({_id: club._id}, {$push: {members: req.body.username}}).exec();
            res.redirect(`/forum/club/${req.params.id}`)
        }
})];

exports.club_remove_member_get = asyncHandler( async (req, res, next ) => {
    const club = await Club.findById(req.params.id).exec();

    if (club === null) {
        // No results.
        const err = new Error("Club not found");
        err.status = 404;
        return next(err);
    } 

    if (req.user) {
        if (club.owner.includes(req.user.username)) {
            res.render("club-add-remove-member-form", {title: "Remove Member", club: club, user: req.user ? unicodeDecode(req.user.username) : req.user});
        } else {
            res.render("club-non-owner", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "Only a club's owner can remove members."});
        }
    } else {
        res.render("club-non-member", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "Only a club's owner can remove members."});
    }
});

exports.club_remove_member_post = [
    body("username", "This is not a valid username").trim().isLength({min: 3}).escape(),
    asyncHandler( async (req, res, next) => {
        const club = await Club.findById(req.params.id).exec();

        if (club === null) {
            // No results.
            const err = new Error("Club not found");
            err.status = 404;
            return next(err);
        } 

        const checkUser = await User.findOne({ username: unicodeDecode(req.body.username) });

        if (!checkUser){
            res.render("club-add-remove-member-form", {title: "Remove Member", club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, errors: [{msg: "User does not exist."}]})
        } else if (club.owner.includes(unicodeDecode(req.body.username))){
            res.render("club-add-remove-member-form", {title: "Remove Member", club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, errors: [{msg: "Cannot remove owner from the Club."}]})
        } else if (club.members.includes(unicodeDecode(req.body.username))){
            await Club.findOneAndUpdate({_id: club._id}, {$pull: {members: req.body.username}}).exec();
            res.redirect(`/forum/club/${req.params.id}`)
        } 
        else{
            res.render("club-add-remove-member-form", {title: "Remove Member", club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, errors: [{msg: "User is not a club member."}]})
        }
})];

exports.club_member_list_get = asyncHandler( async (req, res, next ) => {
    const club = await Club.findById(req.params.id).exec();

    if (club === null) {
        // No results.
        const err = new Error("Club not found");
        err.status = 404;
        return next(err);
    } 

    if (req.user) {
        if (club.members.includes(unicodeDecode(req.user.username))) {
            res.render("club-member-list", {club: club, owner: club.owner[0], user: req.user ? unicodeDecode(req.user.username) : req.user});
        }
        else {
            res.render("club-non-member", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "Only club members can view the member list."});
        }
    } else {
        res.render('log-in-form', {title: "Log in to view this club.", user: req.user ? unicodeDecode(req.user.username) : req.user});
    }
});

exports.club_requests_add_get = asyncHandler( async (req, res, next) => {
    const club = await Club.findById(req.params.id).exec();

    if (club === null) {
        // No results.
        const err = new Error("Club not found");
        err.status = 404;
        return next(err);
    } 

    if (req.user) {
        if (club.members.includes(req.user.username)) {
            res.render("club-non-owner", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "You are already a member of this club."});
        } else if(club.requests.includes(unicodeDecode(req.user.username))){
            res.render("requested", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "You already have a pending request."});
        } else{
            await Club.findOneAndUpdate({_id: club._id}, {$push: {requests: req.user ? unicodeDecode(req.user.username) : req.user}}).exec();
            res.render("requested", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "Your request has gone through."});
        }
    } else {
        res.render('log-in-form', {title: "Log in to view this club.", user: req.user ? unicodeDecode(req.user.username) : req.user});
    }
});

exports.club_accept_requests_get = asyncHandler( async (req, res, next) => {
    const club = await Club.findById(req.params.id).exec();

    if (club === null) {
        // No results.
        const err = new Error("Club not found");
        err.status = 404;
        return next(err);
    } 
    
    if (req.user){
        if (club.owner.includes(unicodeDecode(req.user.username))){
            if (club.requests.length > 0){
                res.render("request-form", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, title: "Pending Club Request(s)", req: club.requests})
            } else {
                res.render("requested", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "No Pending Requests"})
            }
        } else {
            res.render("club-non-owner", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, msg: "Only a club's owner can view requests."});
        }
    } else {
        res.render('log-in-form', {title: "Log in to view this club.", user: req.user ? unicodeDecode(req.user.username) : req.user});
    }
});

exports.club_accept_requests_post = [
    body("username", "Username must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),

    asyncHandler( async (req, res, next) => {
        const club = await Club.findById(req.params.id).exec();

        if (club === null) {
            // No results.
            const err = new Error("Club not found");
            err.status = 404;
            return next(err);
        } 

        const checkUser = await User.findOne({ username: unicodeDecode(req.body.username) });

        if (!checkUser){
            res.render("request-form", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, errors: [{msg: "User does not exist."}]})
        } else if (club.members.includes(unicodeDecode(req.body.username))){
            res.render("request-form", {club: club, user: req.user ? unicodeDecode(req.user.username) : req.user, errors: [{msg: "User already in club."}]})
        } 
        else{
            await Club.findOneAndUpdate({_id: club._id}, {$pull: {requests: req.body.username}, $push: {members: req.body.username}}).exec();
            res.redirect(`/forum/club/${req.params.id}`);
        }
    }
)];