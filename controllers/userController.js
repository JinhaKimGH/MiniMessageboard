const User = require("../models/user");
const {body, validationResult} = require('express-validator');
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

const unicodeDecode = (text) => {
    const decoded = text.replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
    return decoded;
};

exports.user_sign_up_get = asyncHandler(async (req, res, next) => {
    res.render('sign-up-form', {title: "Sign Up for a New Account"});
})

exports.user_sign_up_post = [
    body("username", "Username must be more than three characters.").trim().isLength({min: 3}).escape(),
    body("password", "Password must be more than three characters.").trim().isLength({min: 3}).escape(),

    asyncHandler(async(req, res, next) => {
        const errors = validationResult(req);
        bcrypt.hash(unicodeDecode(req.body.password), 10, async (err, hashedPassword) => {
            if (err){
                return next(err);
            }
            const checkUser = await User.findOne({ username: unicodeDecode(req.body.username) });

            if (!checkUser){
                const user = new User({username: unicodeDecode(req.body.username), password: hashedPassword});
                
                if(!errors.isEmpty()){
                    res.render("sign-up-form", {title: "Sign Up for a New Account", errors: errors.array()});
                } else {
                    await user.save();
                    res.redirect('/forum');
                }
            }
            else{
                res.render("sign-up-form", {title: "Sign Up for a New Account", errors: [{msg: "That username is taken."}]});
            }
          });

    })
]

exports.user_log_in_get = asyncHandler(async (req, res, next) => {
    if (req.session.messages){
        res.render('log-in-form', {title: "Log In", errors: [{msg: req.session.messages[req.session.messages.length - 1], }]});
    }

    else{
        res.render('log-in-form', {title: "Log In",});
    }
})

exports.guest_log_in_get = asyncHandler(async (req, res, next) => {
    res.render('guest-log-in-form', {title: "Log In",});
})