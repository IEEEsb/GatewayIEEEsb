const { Router } = require('express');

const { Auth, Service } = require('./controllers');

const router = new Router();

Auth.controller.mount(router, '/auth');
Service.controller.mount(router, '/service');

router.use(Service.router);

module.exports = router;
