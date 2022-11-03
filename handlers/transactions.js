const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");

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
		});

		const transactions = await prisma.record.findMany({
			where: {
				user_id: user.id,
			},
			select: {
				amount: true,
				user_balance: true,
				operation_response: true,
				date: true,
			},
		});

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(transactions),
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
