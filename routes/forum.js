const express = require('express');
const router = express.Router();
const session = require("express-session");
const passport = require("passport");
const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Controller Modules
const message_controller = require("../controllers/messageController");
const user_controller = require("../controllers/userController")
const club_controller = require("../controllers/clubController")

// Passport Functions
passport.use(
    new LocalStrategy(async(username, password, done) => {
      try {
        const user = await User.findOne({ username: username });
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        };
        bcrypt.compare(password, user.password, (err, res) => {
            if (res) {
              // passwords match! log user in
              return done(null, user)
            } else {
              // passwords do not match!
              return done(null, false, { message: "Incorrect password" })
            }
        })
      } catch(err) {
        return done(err);
      };
    })
  );
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
try {
    const user = await User.findById(id);
    done(null, user);
} catch(err) {
    done(err);
};
});

/// Club Routes ///

// GET Home Page
router.get("/", club_controller.club_list);

// GET request for creating a club
router.get("/create-club", club_controller.club_create_get);

// POST request for creating a club
router.post("/create-club", club_controller.club_create_post);

// GET request for adding members
router.get("/club/:id/add", club_controller.club_add_member_get);

// POST request for adding members
router.post("/club/:id/add", club_controller.club_add_member_post);

// GET request for removing members
router.get("/club/:id/remove", club_controller.club_remove_member_get);

// POST request for removing members
router.post("/club/:id/remove", club_controller.club_remove_member_post);

// GET request to view member list of a club
router.get("/club/:id/member-list", club_controller.club_member_list_get);

// GET request to request to be a club member
router.get("/club/:id/request", club_controller.club_requests_add_get);

// GET request to accept club member requests 
router.get("/club/:id/view-requests", club_controller.club_accept_requests_get);

// POST request to accept club member requests 
router.post("/club/:id/view-requests", club_controller.club_accept_requests_post);

/// Message Routes ///

// GET request for sending a message
router.get('/club/:id/', message_controller.message_create_get);

// POST request to send a message
router.post('/club/:id/', message_controller.message_create_post);


/// User Routes ///

// GET request for signing up
router.get('/sign-up', user_controller.user_sign_up_get);

// POST request to sign up
router.post('/sign-up', user_controller.user_sign_up_post);

// GET request to login
router.get('/log-in', user_controller.user_log_in_get);

// POST request for login
router.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/forum/log-in"
    })
  );

// GET request for logout
router.get('/log-out', (req, res, next) => {
    req.logout(function (err) {
        if (err){
            return next(err);
        }
        res.redirect("/");
    });
});

module.exports = router;