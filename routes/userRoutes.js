import express from 'express'
import bcrypt from 'bcryptjs'
import { createUser } from '../models/userModel.js'

const router = express.Router();

router.post('/register', async (req, res) => {  

    try{
        const {name, email, password, designation} = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            designation,
            createdAt: new Date().toISOString()
        }

        await createUser(user);

      res.json({message: 'User registered successfully'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

export default router;