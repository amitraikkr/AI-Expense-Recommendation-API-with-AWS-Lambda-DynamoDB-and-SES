from aws_cdk import (
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    Duration,
    Stack
)
from constructs import Construct

class BankRecomodationAppStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Create DynamoDB Table with TTL
        table = dynamodb.Table(
            self, "OpenAIResponsesTable",
            partition_key=dynamodb.Attribute(
                name="dateTimeStampKey",
                type=dynamodb.AttributeType.STRING
            ),
            time_to_live_attribute="ttl", # Enabling TTL for automatic deletion
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST
        )

        # Lambda Function to handle the API requests
        lambda_function = _lambda.Function(
            self, "OpenAIApiFunction",
            runtime=_lambda.Runtime.NODEJS_18_X,
            handler="index.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "DYNAMODB_TABLE": table.table_name,
                "OPENAI_API_KEY": "your-openai-api-key",
                "MAX_TOKENS":"500",
                "MODEL_NAME":"gpt-4",
                "SES_EMAIL_SENDER": "example_email@gmail.com"

            },
            timeout=Duration.seconds(30)
        )

        # Grant Lambda permissions to read/write to the DynamoDB Table
        table.grant_read_write_data(lambda_function)

        # Grant permissions to Lambda to send emails using SES
        lambda_function.add_to_role_policy(iam.PolicyStatement(
            actions=["ses:SendEmail", "ses:SendRawEmail"],
            resources=["*"]  # You can restrict this further to verified emails or domains
        ))

        api = apigateway.RestApi(
            self, "OpenAIRecommendationsApi",
            rest_api_name="OpenAIRecommendationsApi",
            description="API for getting OpenAI recommendations",
            deploy_options={
                "stage_name":"prod",
                "throttling_rate_limit":100,
                "throttling_burst_limit":200
            }
        )

        api_key = api.add_api_key(
            "OpenAIRecommendationApiKey",
            api_key_name="openAIAppApiKey"
        )

                # Create a Lambda Integration for API Gateway
        lambda_integration = apigateway.LambdaIntegration(lambda_function)

        # Define an API Resource (endpoint) and method (GET/POST)
        recommendations = api.root.add_resource("recommendations")
        recommendations.add_method(
            "POST", lambda_integration, 
            api_key_required=True
        )

        # Usage Plan for the API Key
        plan = api.add_usage_plan(
            "UsagePlan",
            name="BasicUsagePlan",
            api_stages=[{
                "api": api,
                "stage": api.deployment_stage
            }],
            throttle={
                "rate_limit": 50,  # 50 requests per second
                "burst_limit": 100  # Max burst of 100 requests
            }
        )
        plan.add_api_key(api_key)

        # IAM Role for the Lambda function to access DynamoDB securely
        lambda_function.add_to_role_policy(iam.PolicyStatement(
            actions=["dynamodb:*"],
            resources=[table.table_arn]
        ))



