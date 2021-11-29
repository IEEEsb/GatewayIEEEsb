const { isCelebrateError } = require('celebrate');
// const mongoose = require('mongoose');

class CustomError extends Error {
	constructor(message, code, httpStatus) {
		super(message);
		this.errObject = { message, code };
		this.httpStatus = httpStatus;
	}
}

module.exports.CustomError = CustomError;

function IsErrorCheckerHandler(err) {
	if (err instanceof Error) {
		throw err;
	}

	throw new CustomError('No existe el endpoint que has introducido', 'unknown_endpoint', 400);
}

function JWTErrorHandler(err, req, res, next) {
	if (err.name === 'JsonWebTokenError') {
		return res.status(400).send({
			message: 'El token que has introducido no es válido',
			code: 'invalid_jwt_token',
			violations: err.message,
		});
	}
	next(err);
}

function CustomErrorHandler(err, req, res, next) {
	if (err instanceof CustomError) {
		return res.status(err.httpStatus).send(err.errObject);
	}
	next(err);
}

function CelebrateErrorHandler(err, req, res, next) {
	if (isCelebrateError(err)) {
		return res.status(400).send({
			message: 'Alguno de los campos que has introducido no es válido',
			code: 'invalid_fields',
			violations: Object.fromEntries(err.details),
		});
	}
	next(err);
}

function ParserErrorHandler(err, req, res, next) {
	if (err.type === 'entity.parse.failed') {
		return res.status(400).send({
			message: "Invalid JSON object in the request's body",
			code: 'invalid_json_body',
		});
	}
	next(err);
}

// eslint-disable-next-line no-unused-vars
function GlobalErrorHandler(err, req, res, next) {
	console.error(err);
	console.log('holii');
	return res.status(500).send({
		message: 'Internal server error',
		code: 'internal_server_error',
	});
}

module.exports.handleErrors = (app) => {
	app.use(IsErrorCheckerHandler);
	app.use(JWTErrorHandler);
	app.use(CustomErrorHandler);
	app.use(CelebrateErrorHandler);
	app.use(ParserErrorHandler);
	app.use(GlobalErrorHandler);
};
