# Serverless User API

This is a serverless API built using AWS Lambda, API Gateway, and DynamoDB, written in TypeScript.

## Endpoints

- `POST /register`: Register a new user
- `POST /login`: Login and receive a JWT
- `GET /me`: Get user profile (requires Authorization header)
- `GET /stats`: Get total registered user count

## Development

### Prerequisites
- Node.js 18+
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