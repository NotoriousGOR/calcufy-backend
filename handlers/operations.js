const verifyData = require("../helpers/verifyData");

const jwt = require("jsonwebtoken");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.handler = async (event, context, callback) => {
	try {
		const token = (event.headers["Authorization"] !== undefined) ? event.headers["Authorization"] : false;
		const { operandA, operandB, op } = JSON.parse(event.body);

		// checks for username, password, and that the password is at least 8 characters
		if (!token) {
			return {
				statusCode: 401,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: "Unauthorized" }),
			};
		}

		// attempts to verify the token provided by the user and extracts the username from verification payload
		const username = jwt.verify(
			token,
			process.env.JWT_SECRET,
			(err, decoded) => {
				if (err) {
					// returns error if incorrect token was passed
					callback("401 Unauthorized");
				} else {
					return decoded.username;
				}
			}
		);

		const user = await prisma.user.findFirst({
			where: {
				username: username,
			},
			select: {
				credit: true,
				id: true,
			},
		});

		const operation = await prisma.operation.findFirst({
			where: {
				type: op,
			},
			select: {
				cost: true,
				id: true,
			},
		});

		let res = {
			operation: op,
		};

		switch (res.operation) {
		case "addition":
			if (
				verifyData.operationInputValidator(operandA, operandB, op).pass &&
          user.credit - operation.cost > 0
			) {
				res.result = operandA + operandB;
				res.balance = await handleTransaction(user, operation, res.result);
			}
			break;

		case "subtraction":
			if (
				verifyData.operationInputValidator(operandA, operandB, op).pass &&
          user.credit - operation.cost > 0
			) {
				res.result = operandA - operandB;
				res.balance = await handleTransaction(user, operation, res.result);
			}
			break;

		case "multiplication":
			if (
				verifyData.operationInputValidator(operandA, operandB, op).pass &&
          user.credit - operation.cost > 0
			) {
				res.result = operandA * operandB;
				res.balance = await handleTransaction(user, operation, res.result);
			}
			break;

		case "division":
			if (
				verifyData.operationInputValidator(operandA, operandB, op).pass &&
          user.credit - operation.cost > 0
			) {
				res.result =
            operandB === 0 ? NaN : Number(operandA) / Number(operandB);
				res.balance = await handleTransaction(user, operation, res.result);
			}
			break;

		case "square_root":
			res.result = Math.sqrt(operandA);
			res.balance = await handleTransaction(user, operation, res.result);

			break;

		case "random_string":
			res.result = await fetch(
				"https://www.random.org/strings/?num=1&len=18&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new"
			).then((result) => result.text());

			res.balance = await handleTransaction(user, operation, res.result);
			break;

		default:
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify("Invalid Operator"),
			};
		}

		// return res
		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(res),
		};
	} catch (e) {
		console.error(e);

		return {
			statusCode: 401,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: "Unauthorized",
			}),
		};
	}
};

// handles transaction in db and returns remaining balance
const handleTransaction = async (user, operation, result) => {
	await prisma.record.create({
		data: {
			operation_id: operation.id,
			user_id: user.id,
			amount: operation.cost,
			user_balance: user.credit - operation.cost,
			operation_response: `${result}`,
		},
	});

	const { credit } = await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			credit: user.credit - operation.cost,
		},
		select: {
			credit: true,
		},
	});

	return credit;
};
