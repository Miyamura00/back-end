const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamodb, TABLE_NAME } = require('../config/dynamodb');


const registerUser = async (req, res) => {
    try{
        const {name, email, password, designation} = req.body

        if(!name || !email || !password || !designation){
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            })
        }

        if(password.length < 6){
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            })
        }

        const validDesignations = ['Super Admin', 'Admin', 'Staff']
        if(!validDesignations.includes(designation)){
            return res.status(400).json({
                success: false,
                message: 'Invalid designation'
            })
        }
         
        try{
            const existingUser = await dynamodb.send(new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: 'email = :email',
                ExpressionAttributeValues: {
                    ':email': email.toLowerCase().trim()
                }
            }))

            if(existingUser.Items && existingUser.Items.length > 0){
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                })
            }
        } catch (scanError) {
            console.error('Error checking existing user:', scanError)
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const userId = uuidv4()
        const user = {
            id: userId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword, designation,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        await dynamodb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: user
        }))

        const {password: _, ...userResponse} = user

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userResponse
        })

    } catch (error){
        console.error('Registration error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}


const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            })
        }

        const result = await dynamodb.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email.toLowerCase().trim()
            }
        }))

        if(!result.Items || result.Items.length === 0){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        const user = result.Items[0]

        const passwordMatch = await bcrypt.compare(password, user.password)

        if(!passwordMatch){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        const {password: _, ...userResponse} = user

        res.json({
            success: true,
            message: 'Login successful',
            user: userResponse
        })
    } catch (error){
        console.error('Login error:', error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}

const getAllUsers = async (req, res) => {
    try{
        const result = await dynamodb.send(new ScanCommand({
            TableName: TABLE_NAME,
            ProjectionExpression: 'id, #name, email, designation, createdAt',
            ExpressionAttributeNames: {
                '#name': 'name'
            }
        }))

        res.json({
            success: true,
            users: result.Items || []
        })
    } catch (error){
        console.error('Get all users error:', error)
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        })
    }
}

const getUserById = async (req, res) => {
    try{
        const {id} = req.params

        const result = await dynamodb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { id },
            ProjectionExpression: 'id, #name, email, designation, createdAt',
            ExpressionAttributeNames: {
                '#name': 'name'
            }
        }))

        if(!result.Item){
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }
        res.json({
            success: true,
            user: result.Item
        })
    } catch (error){
        console.error('Error fetching user:', error)
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        })
    }
}

module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById
}