const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const User = require('../models/user_model');
const RefreshToken = require('../models/refresh_token_model');

function checkBodyProperies(requestBody, isLogin = false) {
    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    const nameRegex = /([a-zA-Z]{2,} )([a-zA-Z]{2,})/;
    if (!isLogin)
        if (requestBody.name == "" || requestBody.name == undefined)
            return "the field name is required";
        else if (!nameRegex.test(requestBody.name))
            return "enter a valid name";
    if (requestBody.email == "" || requestBody.email == undefined)
        return "the field email is required";
    else if (!emailRegex.test(requestBody.email))
        return "enter a valid email";
    if (requestBody.password == "" || requestBody.password == undefined)
        return "the field password is required";
    else if (requestBody.password.length < 6)
        return "password is too short";
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
    console.log(`from generateToken:\n ${user}\n`);
    return jwt.sign({id: user._id, name: user.name, email: user.email}, process.env.JWT_SECRET, {expiresIn: "15s"});
}

async function addRefreshToken(userID, generatedRefreshToken) {
    // first check the refresh token already stored to avoid duplicates
    const userRefreshTokens = await RefreshToken.find({userID: userID}).exec();
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
            const token = generateToken(user);
            const refreshToken = jwt.sign(
                {id: user._id, name: user.name, email: user.email},
                process.env.JWT_REFRESH_SECRET,
            );
            await addRefreshToken(user._id, refreshToken);
            res.status(200).json({message: "user logged in successfully", token, refreshToken});
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
    console.log(`from logout\n${req.userData.id}\n`);
    try {
        await RefreshToken.deleteMany({userID: req.userData.id}).exec();
        res.status(204).json({message: "logged out successfully"});
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}

exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.token;
        if (refreshToken == undefined || refreshToken == "")
            return res.status(400).json({message: "the field token is required"});
        
        const storedRefreshToken = await RefreshToken.findOne({refreshToken: refreshToken});
        if (storedRefreshToken != undefined) {
            const userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, userData) => {
            console.log(`from refreshToken\n${userData}\n`);
            if (err) 
                res.status(403).json({message: "the refresh token is invalid"});
            else {
                const accessToken = generateToken(userData);
                res.status(200).json({token: accessToken});
            }
        });
        } else {
            res.status(403).json({message: "the refresh token is invalid"});
        }
            
    } catch(e) {
        console.log(e);
        res.status(500).json({message: "internal server error"});
    }
}