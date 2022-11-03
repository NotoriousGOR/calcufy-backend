const verifyData = require("../helpers/verifyData");

const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.handler = async (event) => {
	try {
		const { Authorization: token } = event.headers["Authorization"];
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
					return false;
				} else {
					return decoded.username;
				}
			}
		);

		// returns error if incorrect token was passed
		if (!username) {
			return {
				statusCode: 401,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "Unauthorized",
				}),
			};
		}

		const user = await prisma.user.findFirst({
			where: {
				username: username,
			},
			select: {
				currency: true,
				id: true,
			},
		});

		let res = {
			a: event.b ? Number(event.a) : "",
			b: event.b ? Number(event.b) : "",
			op: event.op,
		};

		switch (res.op) {
		case "+":
		case "add":
			if (verifyData.operationInputValidator(res.a, res.b, res.op).pass) {
				res.c = res.a + res.b;
				res.balance = await handleTransaction(user, "addition", res.c);
			}
			break;

		case "-":
		case "sub":
			if (verifyData.operationInputValidator(res.a, res.b, res.op).pass) {
				res.c = res.a - res.b;
				res.balance = await handleTransaction(user, "subtraction", res.c);
			}
			break;

		case "*":
		case "mul":
			if (verifyData.operationInputValidator(res.a, res.b, res.op).pass) {
				res.c = res.a * res.b;
				res.balance = await handleTransaction(user, "multiplication", res.c);
			}
			break;

		case "/":
		case "div":
			if (verifyData.operationInputValidator(res.a, res.b, res.op).pass) {
				res.c = res.b === 0 ? NaN : Number(res.a) / Number(res.b);
				res.balance = await handleTransaction(user, "division", res.c);
			}
			break;

		case "sqrt":
		case "square_root":
			res.c = Math.sqrt(res.a);
			res.balance = await handleTransaction(user, "square_root", res.c);

			break;

		case "random_string":
			fetch(
				"https://www.random.org/strings/?num=1&len=8&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new"
			).then((result) => {
				res.string = result.json();
			});

			res.balance = await handleTransaction(
				user,
				"random_string",
				res.string
			);
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

const handleTransaction = async (user, type, result) => {
	const operation = await prisma.operation.findFirst({
		where: {
			type: type,
		},
		select: {
			cost: true,
			id: true,
		},
	});

	await prisma.record.create({
		data: {
			operation_id: operation.id,
			user_id: user.id,
			amount: operation.cost,
			user_balance: user.currency - operation.cost,
			operation_response: result
		},
	});

	return await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			currency: user.currency - operation.cost,
		},
		select: {
			currency: true,
		},
	});
};
