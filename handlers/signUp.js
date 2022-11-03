const userAndPassValidator = require("../helpers/verifyData").userAndPassValidator;

const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

exports.handler = async (event) => {
	try {
		const { username, password } = JSON.parse(event.body);

		// checks for username, password, and that the password is at least 8 characters
		const verified = userAndPassValidator(username, password);

		if (!verified.pass) {
			return {
				statusCode: 401,
				headers: { "Content-Type": "application/json" },
				body: verified.reason,
			};
		}

		// hashing the password and storing in DB
		await prisma.user.create({
			data: {
				username: username,
				password: bcrypt.hashSync(password),
			},
		});

		const token = jwt.sign(
			{
				username,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "24h" }
		);

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username,
				token,
			}),
		};
	} catch (e) {
		console.error(e);
		return { statusCode: 500 };
	}
};
