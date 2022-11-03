const jwt = require("jsonwebtoken");

exports.handler = async (event, context, callback) => {
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

		if (
			event.a === undefined ||
      event.b === undefined ||
      event.op === undefined
		) {
			callback("400 Invalid Input");
		}

		var res = {};
		res.a = Number(event.a);
		res.b = Number(event.b);
		res.op = event.op;

		if (isNaN(event.a) || isNaN(event.b)) {
			callback("400 Invalid Operand");
		}

		switch (event.op) {
		case "+":
		case "add":
			res.c = res.a + res.b;
			break;
		case "-":
		case "sub":
			res.c = res.a - res.b;
			break;
		case "*":
		case "mul":
			res.c = res.a * res.b;
			break;
		case "/":
		case "div":
			res.c = res.b === 0 ? NaN : Number(event.a) / Number(event.b);
			break;
		default:
			callback("400 Invalid Operator");
			break;
		}
		callback(null, res);

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

, , , , )