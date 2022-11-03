const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.handler = async (event, context, callback) => {
	try {
		const token = (event.headers["Authorization"] !== undefined) ? event.headers["Authorization"] : false;

		// checks for username, password, and that the password is at least 8 characters
		if (!token) {
			return {
				statusCode: 401,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: "Unauthorized" }),
			};
		}

		// attempts to verify the token provided by the user and extracts the username from verification payload
		const jwtPayload = jwt.verify(
			token,
			process.env.JWT_SECRET,
			(err, decoded) => {
				if (err) {
					// returns error if incorrect token was passed
					callback("401 Unauthorized");
				} else {
					return decoded;
				}
			}
		);

		const user = await prisma.user.findFirst({
			where: {
				username: jwtPayload.username,
			},
			select: {
				credit: true,
				id: true,
			},
		});

		const records = await prisma.record.findMany({
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

		// return res
		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(records),
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
