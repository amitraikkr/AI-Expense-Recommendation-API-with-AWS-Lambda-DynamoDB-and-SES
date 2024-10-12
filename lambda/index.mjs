import { getOpenAIRecommendations } from './openai.mjs';
import { sendEmail } from './email.mjs';
import { loadConfig } from './config.mjs';

export const handler = async (event) => {

    try {
        
        // Log the raw event to see its structure
        console.log('Event:', event);

        // Parse the event body if it's a string
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        // Extract transactions from the parsed body
        const transactions = body.transactions;
        console.log('Transactions:', transactions);

        //Load condifg file (e.g., other factors)
        const { totalIncome, email }  = await loadConfig();
        
        //Consolidate prompt data
        const  prompt  =  generatePrompt(transactions, totalIncome);

        //Get recommendations from OpenAI
        const recommendations  = await getOpenAIRecommendations(prompt);

        await sendEmail(recommendations, email );

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Recommendations send successsfully'})
        };

    } catch (error) {
        console.error('Error: ', error);
        return{
            statusCode: 500,
            body: JSON.stringify({message: 'Error generating Recommoendations'})
        };

    }
};

// Helper function to generate the OpenAI prompt
const generatePrompt = (transactions, totalIncome) => {
    let categories = {};
    transactions.forEach(tx => {
        if (!categories[tx.category]) {
            categories[tx.category] = 0;
        }
        categories[tx.category] += tx.amount;
    });

    let prompt = `The user has a total income of $${totalIncome}. The breakdown of their spending in the last month is as follows:\n`;

    Object.keys(categories).forEach(category => {
        const amount = categories[category];
        const percentage = ((amount / totalIncome) * 100).toFixed(2);
        prompt += `- ${category}: $${amount} (${percentage}% of total income)\n`;
    });

    prompt += '\nPlease provide recommendations on how the user can optimize their spending and suggest potential areas for improvement. Identify any patterns in spending behavior (e.g., frequent dining out, high spending on shopping). Highlight areas where the user has overspent or deviated from standard budgeting guidelines (e.g., spending too much on discretionary categories like entertainment or dining). Provide actionable recommendations to improve the user’s financial health.';

    return prompt;
};