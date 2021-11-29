const { Joi } = require('celebrate');
const { createProxyMiddleware } = require('http-proxy-middleware');

const { Service } = require('../db/models');
const Utils = require('../utils');

const { validate } = Utils.validators;
const { CustomError } = Utils.errors;

const controller = new Utils.controller.Controller();

const registerValidate = validate({
	body: Joi.object({
		name: Joi.string().trim().required().label('Nombre'),
		path: Joi.string().trim().lowercase().required().label('Path'),
		url: Joi.string().uri().required().label('URL'),
		roles: Joi.array().items(Joi.string()).required().label('Roles'),
		secret: Joi.string().required().label('Secret'),
	}),
});
controller.post('/register', Utils.controller.AllLoggedIn('Service'), registerValidate, async (req, res, next) => {
	try {
		if (req.servicePath !== req.body.path) {
			throw new CustomError('El servicio no puede registrarse en este path', 400);
		}

		await Service.upsert(req.body, {
			where: {
				path: req.body.path,
			},
		});
		res.sendStatus(204);
	} catch (error) {
		next(error);
	}
});

controller.get('/all', Utils.controller.AnyLoggedIn('Service', 'User'), async (req, res, next) => {
	try {
		const services = await Service.findAll();
		res.send({ services });
	} catch (error) {
		next(error);
	}
});

module.exports.controller = controller;

module.exports.router = createProxyMiddleware({
	onProxyReq(proxyReq, req) {
		const time = Date.now();
		const token = Utils.auth.hash(`${req.service.secret}${req.service.path}${time}`);

		proxyReq.setHeader('Authorization', `Service ${token} ${req.service.path} ${time}`);
		proxyReq.removeHeader('X-UserId');
		proxyReq.removeHeader('X-Service');
		if (req.userId) {
			proxyReq.setHeader('X-UserId', `${req.userId}`);
		}
		if (req.servicePath) {
			proxyReq.setHeader('X-Service', `${req.servicePath}`);
		}
	},
	async router(req) {
		const path = req.originalUrl.split('/')[2]?.split('?')[0];
		req.service = await Service.findOne({ where: { path } });
		if (!req.service) {
			throw new CustomError('No existe el endpoint que has introducido', 'unknown_endpoint', 400);
		}

		console.log(`Redirecting to: ${req.service.url}`);
		return `${req.service.url}`;
	},
});
