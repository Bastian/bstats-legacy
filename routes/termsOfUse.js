const express = require('express');
const router = express.Router();

/* GET TOS page. */
router.get('/', function(req, res, next) {

    res.render('static/termsOfUse', {});

});

module.exports = router;