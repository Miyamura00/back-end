const {DynamoDBClient, CreateTableCommand, KeyType, BillingMode} = require ('@aws-sdk/client-dynamodb')
const {DynamoDBDocumentClient} = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-northeast-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const dynamodb = DynamoDBDocumentClient.from(client)

const TABLE_NAME = 'Users'

const createTableIfNotExists = async () => {
    try{
        const params = {
            TableName: TABLE_NAME,
            KeySchema: [
                { AttributeName: 'id', KeyType: 'HASH' } 
            ],
            AttributeDefinitions: [
                { AttributeName: 'id', AttributeType: 'S' }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        }
        await client.send(new CreateTableCommand(params))
        console.log(`Table ${TABLE_NAME} created successfully.`)
    } catch (error) {
       if(error.name === 'ResourceInUseException'){
           console.log(`Table ${TABLE_NAME} already exists.`)
       } else{
        console.error('Error creating table:', error)
        throw error
       }
    }
}

module.exports = {
    dynamodb,
    TABLE_NAME,
    createTableIfNotExists
}