'use strict';
// Vercel serverless function: every /api/* request is rewritten here (see vercel.json) with the original path in ?__p=
const { handleApi } = require('../lib/app');
module.exports = (req, res) => handleApi(req, res);
