const User = require('../models/User')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const registerUser = async(req,res) => {
    const {name, email, password} = req.body;

    try {
        if(!validator.isEmail(email)){
            return res.status(400).json({message: 'Invalid email'})
        }

        if (!validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          })) {
            return res.status(400).json({ 
              message: 'The password must be at least 8 characters long, including a number, an uppercase letter, a lowercase letter, and a special character.'
            });
          }

        const userExists = await User.findOne({email})

        if(userExists) {
            return res.status(400).json({message: 'User already exists'});
        }

        const user = await User.create({
            name,
            email,
            password,
        })

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '30d'})

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const loginUser = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email})
        
        if(user && await user.matchPassword(password)) {
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '30d'})

            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            const yearJoined = user.date.getFullYear()
            const monthJoinedNum = user.date.getMonth()
            const monthJoined = months[monthJoinedNum+1]
            const currentYear = new Date().getFullYear()
            const years = []

            for(let i = yearJoined; i <= currentYear; i++){
                years.push(i)
            }
            
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                years,
                monthJoined,
                token,
            })
        } else {
            res.status(401).json({message: 'Invalid email or password'})
        }
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {registerUser, loginUser}