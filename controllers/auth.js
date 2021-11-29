const jwt = require('jsonwebtoken');
const { Joi } = require('celebrate');

const Utils = require('../utils');

const { User } = Utils.uServices.services;

const { USER_SECRET } = process.env;
const { validate } = Utils.validators;

const controller = new Utils.controller.Controller();

const loginValidate = validate({
	body: Joi.object({
		email: Joi.string().email().trim().lowercase().required().label('Email'),
		password: Joi.string().required().label('Contraseña'),
	}),
});
controller.post('/login', loginValidate, async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const { userId } = await User.checkCredentials(email, password);

		const token = jwt.sign({ userId }, USER_SECRET);

		return res.send({ token });
	} catch (error) {
		return next(error);
	}
});

module.exports.controller = controller;
