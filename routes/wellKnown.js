const express = require('express');
const router = express.Router();

// /.well-known/change-password - Standard well-known URI for password changes
router.get('/change-password', function(req, res) {
    res.redirect('/change-password');
});

module.exports = router;