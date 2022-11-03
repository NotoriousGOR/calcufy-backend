exports.userAndPassValidator = (username, password) => {
	// checking for username and password
	if (!username) {
		return {
			pass: false,
			reason: JSON.stringify({ message: "Missing Username" }),
		};
	} else if (!password) {
		return {
			pass: false,
			reason: JSON.stringify({ message: "Missing Password" }),
		};
	} else if (password.length < 8) {
		return {
			pass: false,
			reason: JSON.stringify({
				message: "Password must be at least 8 character.",
			}),
		};
	}

	// if verification passes all tests return true
	return {
		pass: true,
	};
};

exports.operationInputValidator = (a, b, op) => {
	if (a === undefined || b === undefined || op === undefined) {
		return {
			pass: false,
			reason: JSON.stringify({
				message: "Missing Parameter",
			}),
		};
	}

	if (isNaN(a) || isNaN(b)) {
		return {
			pass: false,
			reason: JSON.stringify({
				message: "Invalid Operand",
			}),
		};
	}

	// if verification passes all tests return true
	return {
		pass: true,
	};
};
