# Serverless User API

This is a serverless API built using AWS Lambda, API Gateway, and DynamoDB.

## Endpoints

- `POST /register`: Register a new user
- `POST /login`: Login and receive a JWT
- `GET /me`: Get user profile (requires Authorization header)
- `GET /stats`: Get total registered user count

## Deploy
- Whenever code pushed on main it will deploy automatically

## Notes

- DynamoDB is used to store user data.
- JWT is used for authentication.
- Email notifications can be set up via CloudWatch + SES or post-deploy hooks.
- You should set 3 secrets on github if you want to use it in your AWS account AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, JWT_SECRET
- /stats is protected with x-api-key