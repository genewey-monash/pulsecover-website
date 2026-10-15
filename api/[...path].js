'use strict';
// Vercel serverless function: every /api/* request lands here.
const { handleApi } = require('../lib/app');
module.exports = (req, res) => handleApi(req, res);
