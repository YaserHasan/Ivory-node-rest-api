const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const validationUtils = require('../utils/validation_utils');

const User = require('../models/user_model');
const RefreshToken = require('../models/refresh_token_model');

function checkBodyProperies(requestBody, isLogin = false) {
    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    const nameRegex = /([a-zA-Z]{2,} )([a-zA-Z]{2,})/;
    if (!isLogin)
        if (validationUtils.validateString(requestBody.name, 'name', nameRegex))
            return validationUtils.validateString(requestBody.name, 'name', nameRegex);
    if (validationUtils.validateString(requestBody.email, 'email', emailRegex))
        return validationUtils.validateString(requestBody.email, 'email', emailRegex);
    if (validationUtils.validateString(requestBody.password, 'password', undefined, 6))
        return validationUtils.validateString(requestBody.password, 'password', undefined, 6);
}

async function checkIfUserExsists(userEmail) {
    // this function returns false if the user doesn't exisists
    // and returns the user object otherwise
    const usersWithThisEmail = await User.find({ email: userEmail }).exec();
    if (usersWithThisEmail.length <= 0)
        return false;
    return usersWithThisEmail[0];
}


function generateToken(user) {
    return jwt.sign(
        {
            _id: user._id,
            name: user.name,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            algorithm: "HS256",
            expiresIn: "10m"
        },
    );
}

async function addRefreshToken(userID, generatedRefreshToken) {
    // first check the refresh token already stored to avoid duplicates
    const userRefreshTokens = await RefreshToken.find({refreshToken: generatedRefreshToken}).exec();
    if (userRefreshTokens.length > 0) return;
    const refreshToken = new RefreshToken({
        userID: userID,
        refreshToken: generatedRefreshToken,
    });
    await refreshToken.save();
}

exports.register = async (req, res) => {
    try {
        // body validation
        if (checkBodyProperies(req.body)) {
            return res.status(400).json({message: checkBodyProperies(req.body)});
        }
        // check if user exisists
        const isUserExsists = await checkIfUserExsists(req.body.email);
        if (isUserExsists) {
            return res.status(409).json({message: "Email already in use!"});
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).json({message: "user registered Successfully"});
        
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.login = async (req, res) => {
    try {
        // body validation
        if (checkBodyProperies(req.body, true)) {
            return res.status(400).json({message: checkBodyProperies(req.body, true)});
        }
        // check if user exisists
        const isUserExsists = await checkIfUserExsists(req.body.email);
        if (!isUserExsists) {
            return res.status(401).json({message: "The email doesn't belong to an account"});
        }
        const user = isUserExsists;
        const result = await bcrypt.compare(req.body.password, user.password);
        if (result) {
            const accessToken = generateToken(user);
            const refreshToken = jwt.sign(
                {_id: user._id, name: user.name, email: user.email},
                process.env.JWT_REFRESH_SECRET,
            );
            await addRefreshToken(user._id, refreshToken);
            res.status(200).json({message: "user logged in successfully", accessToken, refreshToken});
        }
        else {
            res.status(401).json({message: "The password is incorrect"});
        }
        
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.logout = async (req, res) => {
    try {
        await RefreshToken.deleteMany({userID: req.userData._id}).exec();
        res.status(200).json({message: "logged out successfully"});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (validationUtils.validateString(refreshToken, 'refreshToken'))
            return res.status(400).json({message: validationUtils.validateString(refreshToken, 'refreshToken')});
        
        const storedRefreshToken = await RefreshToken.findOne({refreshToken: refreshToken});
        if (storedRefreshToken != undefined) {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, userData) => {
            if (err) 
                res.status(401).json({message: "invalid refreshToken"});
            else {
                const accessToken = generateToken(userData);
                res.status(200).json({accessToken: accessToken});
            }
        });
        } else {
            res.status(401).json({message: "invalid refreshToken"});
        }
            
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.checkAuth = (req, res) => {
    return res.status(204).send();
}