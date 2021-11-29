const { Op } = require('sequelize');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { User } = require('../db/models');
const { CustomError } = require('./errors');

const { USER_SECRET, SERVICE_SECRET } = process.env;

module.exports.hash = (text) => crypto.createHash('sha256').update(text, 'utf8').digest().toString('hex');

module.exports.randomBytes = (size) => crypto.randomBytes(Math.ceil(size / 2)).toString('hex');

module.exports.userHasAllRoles = async (userId, roles) => {
	const user = await User.findOne({ where: { id: userId, roles: { [Op.contains]: roles } } });
	return !!user;
};

module.exports.userHasAnyRoles = async (userId, roles) => {
	const user = await User.findOne({ where: { id: userId, roles: { [Op.contained]: roles } } });
	return !!user;
};

module.exports.authentication = async (req, res, next) => {
	try {
		if (req.headers?.authorization) {
			const [authType, token, ...authArgs] = req.headers.authorization.split(' ');
			if (!token) {
				throw new CustomError('No has introducido un token en la autorización', 'auth_no_token', 401);
			}
			console.log(authType, token, authArgs);
			if (authType === 'User') {
				const { userId } = jwt.verify(token, USER_SECRET);

				req.userId = userId;
			}
			if (authType === 'Service') {
				const [servicePath, time] = authArgs;
				const hashedPath = module.exports.hash(`${SERVICE_SECRET}${servicePath}${time}`);
				if (hashedPath !== token) {
					throw new CustomError('El token que has introducido no es válido', 'auth_token_not_valid', 401);
				}
				if (Math.abs(Date.now() - time) > 5 * 60 * 1000) {
					throw new CustomError('El token que has introducido ha expirado', 'auth_token_expired', 401);
				}
				req.servicePath = servicePath;
			}
			if (!['User', 'Service'].includes(authType)) {
				throw new CustomError('El tipo de autenticación que estás utilizando no está soportado', 'auth_type_not_valid', 401);
			}
		} else {
			delete req.userId;
			delete req.servicePath;
		}

		return next();
	} catch (error) {
		delete req.userId;
		delete req.servicePath;
		return next(error);
	}
};
