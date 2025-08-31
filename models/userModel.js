import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
})

const tableName = process.env.DYNAMO_TABLE_NAME

export const createUser = async (user) => {
    
    const params={
        TableName: tableName,
        Item: user
    }

    return dynamoDB.put(params).promise();
}