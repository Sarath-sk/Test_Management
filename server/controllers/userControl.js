const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {default:mongoose} = require("mongoose");
const generateToken = require('../utils/generateToken');


const registerUser = async (req, res) =>{
    try{
        const { name, email, password, role } = req.body;

        if(!name || !email || !password || !role){
            return res.status(400).json({
                message: "Please fill mandatory fields"
            });
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                message: "User already exists."
            });
        }

        // Hashing password
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password,
            role: role || "tester"
        });

        await newUser.save()

        res.status(200).json({
            message: "User created successfully",
            token: generateToken(newUser._id),
            newUser
        });

    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
};


const loginUser = async (req, res) =>{
    try{
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message: "Please fill mandatory fields"
            });
        }

        const userMatch = await User.findOne({email});
        if(!userMatch){
            return res.status(404).json({
                message: "User not found!"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, userMatch.password);
        if(!isMatch){
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        res.status(200).json({
            message: "User logged in successfully!",
            token: generateToken(userMatch._id),
            userMatch
        });

    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

const getMe = async (req, res) =>{
    try{
        res.json(req.user);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

const getProfile = async (req, res) =>{
    try{
        const {name, avater} = req.body;
        const userId = req.user._id;

        const user = await User.findByIdAndUpdate(userId, {name, avater}, {new:true});
        res.status(200).json({
            user
        });
        
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

// Admin only - get all users
const getAllUsers = async (req, res) =>{
    try{
        
        const users = await User.find()
            .sort({ createdAt: -1 });

        res.status(200).json(users);
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

// Admin only - update users
const updateUser = async (req, res) =>{
    try{
        const {name, role, isActive} = req.body;
        const userId = req.params.id;
        const user = await User.findByIdAndUpdate(userId, {name, role, isActive}, {new: true});
        if(!user){
            return res.status(404).json({
                message: "User not found!"
            });
        }

        res.status(200).json(user);

    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

// Admin only - delete user
const deleteUser = async (req, res) =>{
    try{
        const userId = req.params.id;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message: "user not found!"
            });
        }

        await User.findByIdAndDelete(userId);

        res.status(204).json({
            message: "User deleted!"
        });
        
    }catch(error){
        return res.status(500).json({
            message: error.message
        });
    }
}

module.exports = {registerUser, loginUser, getMe, getProfile, getAllUsers, updateUser, deleteUser};