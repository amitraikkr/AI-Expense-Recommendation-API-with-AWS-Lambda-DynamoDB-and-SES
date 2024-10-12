<h1>AI Expense Recommendation API with AWS Lambda, DynamoDB, and SES</h1>

<p align="center">
  <strong>Serverless AI-powered Expense Recommendation API</strong> built with <strong>AWS Lambda</strong>, <strong>DynamoDB</strong>, and <strong>SES</strong>, leveraging <strong>OpenAI</strong> for personalized financial insights.
</p>

<h2>🛠️ Project Introduction</h2>

<p>
  This project demonstrates how to create a serverless API that uses OpenAI to analyze user transaction data and provide personalized recommendations for optimizing expenses. The API is built with AWS Lambda, DynamoDB, and SES to ensure that it is secure, scalable, and fault-tolerant.
</p>

<p>
  The API processes transactions via a REST API endpoint, generates insights with OpenAI, and emails recommendations to the user via AWS SES.
</p>

<h2>🚀 Installation and Setup</h2>

<h3>Prerequisites</h3>
<ul>
  <li>AWS Account with permissions for Lambda, DynamoDB, API Gateway, and SES.</li>
  <li>Node.js and NPM installed locally.</li>
  <li>Postman for API testing.</li>
</ul>

<h3>Steps</h3>
<ol>
  <li>Clone the repository:</li>
  <pre><code>git clone https://github.com/your-username/ai-expense-recommendation-api.git && cd ai-expense-recommendation-api</code></pre>
  
  <li>Install dependencies:</li>
  <pre><code>npm install</code></pre>
  
  <li>Deploy the stack using AWS CDK:</li>
  <pre><code>cdk deploy</code></pre>
  
  <li>Set the required environment variables in your Lambda function:
    <ul>
      <li><code>DYNAMODB_TABLE</code>: Name of your DynamoDB table.</li>
      <li><code>OPENAI_API_KEY</code>: OpenAI API key.</li>
      <li><code>SES_EMAIL_SENDER</code>: Verified SES sender email.</li>
      <li><code>AWS_REGION</code>: AWS region (e.g., <code>us-east-1</code>).</li>
    </ul>
  </li>
</ol>

<h2>🔥 How to Use the API</h2>

<h3>Testing the API with Postman</h3>
<ol>
  <li>Create a new <strong>POST</strong> request in Postman.</li>
  <li>Use your API Gateway URL as the endpoint:</li>
  <pre><code>https://&lt;api-id&gt;.execute-api.&lt;region&gt;.amazonaws.com/prod/recommendations</code></pre>
  
  <li>Add an API key header:
    <pre><code>x-api-key: &lt;your-api-key&gt;</code></pre>
  </li>
  
  <li>Add the following JSON body:
    <pre><code>{
      "transactions": [
        { "date": "2024-09-01", "category": "Groceries", "amount": 150.00 },
        { "date": "2024-09-05", "category": "Dining Out", "amount": 75.50 }
      ]
    }</code></pre>
  </li>
  
  <li>Send the request and check for a successful response.</li>
</ol>

<h3>Testing the API with cURL</h3>
<pre><code>curl -X POST https://&lt;api-id&gt;.execute-api.&lt;region&gt;.amazonaws.com/prod/recommendations \
-H "x-api-key: &lt;your-api-key&gt;" \
-H "Content-Type: application/json" \
-d '{
  "transactions": [
    { "date": "2024-09-01", "category": "Groceries", "amount": 150.00 },
    { "date": "2024-09-05", "category": "Dining Out", "amount": 75.50 }
  ]
}'</code></pre>

<h2>📊 Sample Request and Response</h2>

<h3>Sample Request (JSON):</h3>
<pre><code>{
  "transactions": [
    { "date": "2024-09-01", "category": "Groceries", "amount": 150.00 },
    { "date": "2024-09-05", "category": "Dining Out", "amount": 75.50 }
  ]
}</code></pre>

<h3>Sample Response (JSON):</h3>
<pre><code>{
  "message": "Recommendations sent successfully"
}</code></pre>

