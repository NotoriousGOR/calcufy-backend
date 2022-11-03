const dataVerification = require("../helpers/verifyData").dataVerification;

const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

exports.handler = async (event) => {
	try {
		const { username, password } = JSON.parse(event.body);
		// checks for username, password, and that the password is at least 8 characters
		const verified = dataVerification(username, password);

		if (!verified.pass) {
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: verified.reason,
			};
		}

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
