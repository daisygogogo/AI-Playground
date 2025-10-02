<p align="center">
  <h3 align="center">Contact Management App Backend</h3>

  <p align="center">
    Use NestJS + Prisma + Postgres
    <br>
    <br>
    :clap::clap::tada::tada::tada::tada::clap::clap:
    <br>
    <br>
    Base project made with much :heart:. Contains CRUD, advanced patterns and much more!
    <br>
  </p>
</p>

## What's included

- [x] Contacts CRUD: create, read, update and delete contacts!
- [x] Authentication with JWT tokens
- [x] Role basic control
- [x] More logical directory structure
- [x] Examples of NestJS controllers, services, repositories, guards, interceptors, etc
- [x] Env file included with al the environment variables that are mandatory already prepared
- [x] Usage of Prisma (An ORM) :)
- [x] A Postgres DB to store the users
- [x] View your Swagger api docs through route '/api'

## Setup

**Requirements:**
- Node.js version 18.0.0 or higher

Install dependencies first

```bash
npm i
```

Create a file with this content and call it .env

```bash
ENVIRONMENT=localhost

# POSTGRES
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=postgres

# Prisma database connection
DATABASE_URL=postgresql://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}

# Nest
PORT=3000

# Security
JWT_ACCESS_SECRET=a8e9f3b6d4c2h7j8k5n1o3p2q9r6s4t0v5w7x8z1y3m6n2k8j9l4h5g7f1e2c3b9a0
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=f4g5h6j7k8l9m0n1p3o5q7r2s6t8v1w9x4z3y2k5j8h7g9f2e4c6b8a0o1m2n7p9q5
JWT_REFRESH_EXPIRES_IN=7d
```

The first time you start the project, you can run the set up command:

```bash
npm run setup
```

Or go step by step.

Create the postgres database

```bash
npm run docker:db
```

Generate the prisma schema

```bash
npm run prisma:generate
```

Run migrations to create necessary tables in the DB

```bash
npm run prisma:migrate:dev
```

Seed the database with the first user

```bash
npm run prisma:seed
```

Affter setting up, you can start the application

```bash
npm start
```



## Thanks
