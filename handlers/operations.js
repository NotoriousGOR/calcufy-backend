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

		let res = {
			a: event.b ? Number(event.a) : "",
			b: event.b ? Number(event.b) : "",
			op: event.op,
		};

		switch (res.op) {
		case "+":
		case "add":
			if (verifyData.operationInputValidator(res.a, res.b, res.op).pass) {
				res.balance = await handleTransaction(username, "addition");
				res.c = res.a + res.b;
			}
			break;

		case "-":
		case "sub":
			if (verifyData.operationInputValidator(res.a, res.b, res.op).pass) {
				res.balance = await handleTransaction(username, "subtraction");
				res.c = res.a - res.b;
			}
			break;

		case "*":
		case "mul":
			if (verifyData.operationInputValidator(res.a, res.b, res.op).pass) {
				res.balance = await handleTransaction(username, "multiplication");
				res.c = res.a * res.b;
			}
			break;

		case "/":
		case "div":
			if (verifyData.operationInputValidator(res.a, res.b, res.op).pass) {
				res.balance = await handleTransaction(username, "division");
				res.c = res.b === 0 ? NaN : Number(res.a) / Number(res.b);
			}
			break;

		case "sqrt":
		case "square_root":
			res.balance = await handleTransaction(username, "square_root");
			res.c = Math.sqrt(res.a);
			break;

		case "random_string":
			res.balance = await handleTransaction(username, "random_string");
			res.string = fetch(
				"https://www.random.org/strings/?num=1&len=8&digits=on&upperalpha=on&loweralpha=on&unique=on&format=plain&rnd=new"
			).then((result) => {
				console.log(result.json());
				return result.json();
			});
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

const handleTransaction = async (username, type) => {
	const user = await prisma.user.findFirst({
		where: {
			username: username,
		},
	});

	const { cost } = await prisma.operation.findFirst({
		where: {
			type: type,
		},
		select: {
			cost: true,
		},
	});

	return await prisma.user.update({
		where: {
			username: username,
		},
		data: {
			currency: user.currency - cost,
		},
		select: {
			currency: true,
		},
	});
};
