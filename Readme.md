# Procurified Backend Assessment

This project contains solutions for the Resource Lineage Query (Problem 1) and the Expression Evaluation/Recalculation system (Problem 2).

## Installation

1. Prerequisites
Node.js: v22.14.0 or higher, PostgreSQL: A running instance with a database named procurifieddb

2. Database Initialization
Ensure your database has the required tables. You can run these commands in your SQL editor

```bash
-- Problem 1
CREATE TABLE IF NOT EXISTS singleresource (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  "parentId" INTEGER REFERENCES singleresource (id) ON DELETE SET NULL
);

-- Problem 2
CREATE TABLE IF NOT EXISTS variables (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS calculations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  expression TEXT NOT NULL,
  calculated_value DOUBLE PRECISION NOT NULL DEFAULT 0
);
```

3. Environment Variables
Rename .env.example file in the root directory to .env and uncomment and update your environment variables:

```bash
#PORT=3000
#DATABASE_URL=postgresql://user:password@localhost:5432/procurifieddb
#PG_POOL_MAX=10
#PG_IDLE_TIMEOUT_MS=30000
#PG_CONNECTION_TIMEOUT_MS=5000
```
4. Install Dependencies

```bash
npm install
```
## Running the application

Development Mode (with Nodemon):

```bash
npm run dev

```

Production Mode :

```bash
npm run start

```

Run Tests (Jest) :

```bash
npm test

```

## Testing with Postman

I have provided a public Postman collection to test the endpoints: [View Postman Collection](https://www.postman.com/lunar-escape-729248/workspace/procurified-assessment/collection/16926523-6d783e81-6ef5-45d1-832e-f891887b679d?action=share&source=copy-link&creator=16926523)

Core Endpoints:

1. GET /api/v1/lineage/:id: Returns the full ancestor array from root to parent. 
2. POST /api/v1/calculations/:id/evaluate: Evaluates a hybrid JSON/Arithmetic expression and updates the database. 
3. POST /api/v1/variables/:id/recalculate: Finds all calculations referencing a variable and refreshes their values. 

## Libraries Used

1. pg: for Postgres connection pooling and querying
2. mathjs: for arithmetic evaluation
3. dotenv: for environment configuration
4. helmet: for hardening http headers
5: jest: for unit testing