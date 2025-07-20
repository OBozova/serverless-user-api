# Serverless User API

This is a serverless API built using AWS Lambda, API Gateway, and DynamoDB.

## Endpoints

- `POST /register`: Register a new user
- `POST /login`: Login and receive a JWT
- `GET /me`: Get user profile (requires Authorization header)
- `GET /stats`: Get total registered user count

## Deploy

```bash
npm install
sls deploy
```

## Notes

- DynamoDB is used to store user data.
- JWT is used for authentication.
- AWS WAF and concurrency settings should be configured in AWS console. (This is for me just for limiting the costs)
- Email notifications can be set up via CloudWatch + SES or post-deploy hooks.
