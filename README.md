
# Calcufy Backend:
Implement a Web platform to provide a simple calculator functionality (addition, subtraction, multiplication, division, square root, and a random string generation) where each functionality will have a separate cost per request. 

User’s will have a starting credit / balance. Each request will be deducted from the user’s balance. If the user’s balance isn’t enough to cover the request cost, the request shall be denied. 

This Web application and its UI application should be live (on any platform of your choice) and should be ready to be configured and used locally for any other developer (having all instructions written for this purpose). 

# Calcufy:
[Project Link](calcufy.fly.dev)

[Backend Repo](https://github.com/NotoriousGOR/calcufy-backend)
[Frontend Repo](https://github.com/NotoriousGOR/calcufy-frontend)

Requirements:

* Use third party operation for random string https://www.random.org/clients
* All client-server interaction should be through RESTful API (versionated).
* Collection endpoints should be able to provide filters and pagination.
* Use a Bootstrap or Material Design library (CSS/Design Library) of your choice.
* Add automated tests such as Unit Test (whether for frontend or backend).
* Records should be soft-deleted only.

🛠 With:

* Node.js
* Prisma
* JWT
* BCrypt
* AWS CloudFormation
* Lambda
* RDS

## Installation

1. Be sure to follow this guide first: [Prisma Docs](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-aws-lambda#prerequisites)

2. Clone the project

```bash
  git clone https://github.com/NotoriousGOR/calcufy-backend
```

3. Go to the project directory

```bash
  cd my-project
```

4. Install dependencies

```bash
  npm install
```

## Deployment

To deploy this project run

```bash
  npm run deploy
```


## API Reference

#### Create new account

```http
  POST /sign-up
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required** |
| `password` | `string` | **Required** |

#### Login (Requires Authorization Header)

```http
  POST /login
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required** |
| `password` | `string` | **Required** |

#### Perform operations (Requires Authorization Header)

```http
  POST /operations
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `operandA` | `string` | **Required** (not on random_string, or square_root)|
| `operandB` | `string` | **Required** (not on random_string, or square_root)|
| `op` | `string` | **Required** (addition, subtraction, multiplication, division, square_root, random_string)

#### Get performed operations (Requires Authorization Header)

```http
  POST /records
```
