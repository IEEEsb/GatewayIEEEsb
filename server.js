const express = require('express');
const morgan = require('morgan');

const Utils = require('./utils');
const Api = require('./api');

const { PORT, GATEWAY_URL, GATEWAY_SECRET, SERVICE_SECRET, SERVICE_NAME, SERVICE_PATH, SERVICE_URL } = process.env;

const app = express();

app.use(Utils.auth.authentication);

morgan.token('user', (req) => {
	if (req.userId) return `User: ${req.userId}`;
	if (req.servicePath) return `Service: ${req.servicePath}`;
	return 'not logged in';
});
app.use(morgan('[:date[iso]] :remote-addr (:user) :method :url :status :res[content-length] B - :response-time ms'));

app.use('/api', Api);

Utils.errors.handleErrors(app);

app.listen(PORT, async () => {
	console.log(`Server listening on port ${PORT}`);
	try {
		await Utils.uServices.init(GATEWAY_SECRET, GATEWAY_URL, {
			name: SERVICE_NAME,
			path: SERVICE_PATH,
			url: SERVICE_URL,
			secret: SERVICE_SECRET,
			roles: Utils.controller.ROLES,
		});
	} catch (err) {
		console.log(err);
	}
});
