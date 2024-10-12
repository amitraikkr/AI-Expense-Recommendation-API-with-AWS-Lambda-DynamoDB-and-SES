import axios from 'axios';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDBClient = new DynamoDBClient( { region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDBClient);

// Retry function with exponential backoff
const retryWithExponentialBackoff = async (fn, retries = 5, delay = 1000) => {
    for (let i = 0; i < retries; i++){
        try {
            // Try the function, return the result if successful
            return await fn();
        } catch (error) {
            // If it's the last attempt, rethrow the error
            if ( i == retries - 1) {
                throw error;
            }
            // Calculate the wait time for exponential backoff
            const waitTime = delay * Math.pow(2, i);
            console.log('Retrying in ${waitTime}ms due to error: ${error.message}');
            //wait before retrying 
            await new Promise((resolve) => setTimeout(resolve, waitTime));

        }

    }
};

// Function to save the OpenAI response into DynamoDB with TTL
const saveResponseToDynamoDB = async (responseText) => {
    const now = new Date();
    const sixMonthsLater = new Date(now.setMonth(now.getMonth() + 6 ));

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            dateTimeStampKey: now.toISOString(), //use the current date/time as the partition key
            response: responseText,
            ttl: Math.floor(sixMonthsLater.getTime() / 1000)  //TTL in seconds for six months
        }
    };

    try {
        await dynamoDb.send(new PutCommand(params));
        console.log('OpenAI response saved to DynamdoDB successfully.')
    } catch (error) {
        console.error('Error saving OpenAI response to DynamoDB:', error.message);
        throw new Error('Failed to save response to DynamoDB.');
    }

};


//Function to call OpenAI to get the recommendations
export const getOpenAIRecommendations = async (prompt) => {

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const maxTokens = parseInt(process.env.MAX_TOKENS) || 500;
    const modelName = process.env.MODEL_NAME || 'gpt-4o-mini';

    const headers = {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
    };

    const data = {
        model: modelName,
        messages: [{ role: "system", content: prompt }],
        max_tokens: maxTokens
    };

    console.log('Calling OpenAI API with data: ', JSON.stringify(data,null, 2));
    
    try {
        
        //Perform the API request with exponential backoff in case of transient API
        const openAiResponse = await retryWithExponentialBackoff(() => 
            axios.post('https://api.openai.com/v1/chat/completions', data, {
                headers,
                timeout: 50000 // 5 seconds timeout to avoid long delays
            })
        );

        const responseText = openAiResponse?.data?.choices?.[0]?.message?.content?.trim() || 'No response from OpenAI.';
        console.log('OpenAI API response:', responseText);

        // Save the OpenAI response to DynamoDB with TTL
        await saveResponseToDynamoDB(responseText);

        return responseText;

    } catch (error) {
        console.error('Error calling OpenAI API:', error.message);
        throw new Error('Failed to communicate with OpenAI.');
    }
}