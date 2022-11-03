const jwt = require("jsonwebtoken");

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

		// attempts to verify the token provided by the user
		const user = jwt.verify(
			token,
			process.env.JWT_SECRET,
			(err, verifiedJwt) => {
				if (err) {
					return false;
				} else {
					return verifiedJwt;
				}
			}
		);

		// returns error if incorrect token was passed
		if (!user) {
			return {
				statusCode: 401,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: "Unauthorized",
				}),
			};
		}

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username,
				user,
			}),
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
