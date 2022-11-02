const { dataVerification } = require("../helpers/verifyData");

const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

exports.handler = async (event) => {
	try {
		const { username, password } = JSON.parse(event.body);
		// checks for username, password, and that the password is at least 8 characters
		const verified = await dataVerification(username, password);

		if (!verified.pass) {
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: verified.reason,
			};
		}

		const user = await prisma.user.findFirst({
			where: {
				username: username,
			},
		});

		// if user doesn't exist return error
		if (!user) {
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: `Username ${username} does not exist`,
				}),
			};
		}

		// comparing db password and supplied password, if fails it returns an error
		if (!bcrypt.compareSync(password, user.password)) {
			return {
				statusCode: 400,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "Password doesn't match",
				}),
			};
		}

		const token = jwt.sign(
			{
				username,
				profile: user.profile,
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
		console.log(e);
		return {
			statusCode: 500,
		};
	}
};
