# Serverless User API

This is a serverless API built using AWS Lambda, API Gateway, and DynamoDB, written in TypeScript.

## Endpoints

- `POST /register`: Register a new user
- `POST /login`: Login and receive a JWT
- `GET /me`: Get user profile (requires Authorization header)
- `GET /stats`: Get total registered user count

## Development

### Prerequisites
- Node.js 22
- npm
- AWS SAM CLI

### Building the Project

The project is written in TypeScript and needs to be compiled before deployment.

#### Option 1: Using the build script
```bash
./build.sh
```

#### Option 2: Manual build
```bash
cd src
npm install
npm run build
```

This will compile TypeScript files from `src/` to JavaScript in `src/dist/`.

### Project Structure
```
src/
├── handlers/           # Lambda function handlers (TypeScript)
│   ├── login.ts
│   ├── register.ts
│   ├── me.ts
│   └── stats.ts
├── utils/              # Utility functions
│   └── auth.ts         # JWT authorizer
├── types/              # TypeScript type definitions
│   └── index.ts
├── dist/               # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

### Development Workflow
1. Make changes to TypeScript files in `src/`
2. Run `npm run build` in the `src/` directory to compile
3. Deploy using SAM CLI

#### Watch mode for development
```bash
cd src
npm run dev
```

## Deploy
- Whenever code pushed on main it will deploy automatically
- Make sure to run the build process before deployment

## Local Deploy(Without pipeline)
- Run following commands in order
- cd src && npm i && cd ..
- sh build.sh
- sam build
- After running those get access key from AWS Console(from IAM) and set environment variables AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
- After setting environment variables 'run sam deploy --guided' or you can basicly run 'sam deploy --no-confirm-changeset --no-fail-on-empty-changeset --stack-name serverless-user-api --region eu-central-1 --capabilities CAPABILITY_IAM --resolve-s3 --parameter-overrides ParameterKey=JwtSecret,ParameterValue=$$$' instead of $$$ you should use your secret
- When deployment finished look into API Gateway from console and take its url and you can use it on your own account

## Notes

- **TypeScript**: All source code is written in TypeScript with strict type checking enabled
- **DynamoDB** is used to store user data
- **JWT** is used for authentication
- **Email notifications** can be set up via CloudWatch + SES or post-deploy hooks
- You should set 3 secrets on GitHub if you want to use it in your AWS account: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `JWT_SECRET`
- `/stats` is protected with x-api-key
- The Lambda runtime is Node.js 22.x

## Type Safety

This project includes comprehensive TypeScript types for:
- API request/response objects
- DynamoDB items
- JWT tokens and auth contexts
- Error responses

All handlers include proper error handling and input validation.

## Testing Front End
- first set .env inside frontend folder and inside it you should set VITE_API_BASE_URL and VITE_API_KEY
- cd frontend
- npm i
- npm run dev(For testing locally)
- for automatic deploy you should set FRONTEND_BUCKET_NAME, VITE_API_KEY, VITE_API_URL secrets from github and it will deploy into your S3 bucket