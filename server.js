const express = require('express')
const cors = require('cors')
const useRoutes = require('./routes/userRoutes')
const { createTableIfNotExists} = require('./config/dynamodb')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/users', useRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' })
})

app.use((error, req, res, next) => {
    console.error('Server error:',error)
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    })
})

app.use('*', (req, res) => {
    res.status(404).json({ 
    success: false, message: 'Route not found' })
})

const startServer = async () => {
    try{
        await createTableIfNotExists()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
            console.log('DynamoDB table: Users')
            console.log(`Health check: http://localhost:${PORT}/health`)
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()

module.exports = app