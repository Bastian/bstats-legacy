const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const databaseManager = require('../util/databaseManager');
const dataManager = require('../util/dataManager');
const async = require('async');

const saltRounds = 10;

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Helper function to set required template locals
function setTemplateLocals(req, res, callback) {
    async.parallel([
        function (cb) {
            dataManager.getAllSoftware(['name', 'url', 'globalPlugin'], cb);
        },
        function (cb) {
            if (req.user !== undefined) {
                dataManager.getPluginsOfUser(req.user.username, ['name', 'software'], cb);
            } else {
                cb(null, []);
            }
        }
    ], function(err, results) {
        if (err) {
            return callback(err);
        }
        res.locals.allSoftware = results[0];
        res.locals.myPlugins = results[1];
        // Replace the software id with a proper object
        for (let i = 0; i < results[1].length; i++) {
            for (let j = 0; j < results[0].length; j++) {
                if (results[1][i].software === results[0][j].id) {
                    results[1][i].software = results[0][j];
                }
            }
        }
        callback();
    });
}

// GET /change-password - Show password change form
router.get('/', ensureAuthenticated, function(req, res, next) {
    setTemplateLocals(req, res, function(err) {
        if (err) {
            return next(err);
        }
        res.render('changePassword', {
            title: 'Change Password',
            error: null,
            success: null
        });
    });
});

// POST /change-password - Handle password change
router.post('/', ensureAuthenticated, function(req, res, next) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const username = req.user.username.toLowerCase();

    function renderWithLocals(templateData) {
        setTemplateLocals(req, res, function(err) {
            if (err) {
                return next(err);
            }
            res.render('changePassword', templateData);
        });
    }

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        return renderWithLocals({
            title: 'Change Password',
            error: 'All fields are required.',
            success: null
        });
    }

    if (newPassword !== confirmPassword) {
        return renderWithLocals({
            title: 'Change Password',
            error: 'New passwords do not match.',
            success: null
        });
    }

    if (newPassword.length < 6) {
        return renderWithLocals({
            title: 'Change Password',
            error: 'New password must be at least 6 characters long.',
            success: null
        });
    }

    // Get current password hash from Redis
    databaseManager.getRedisCluster().hmget(`users:${username}`, ['password'], function(err, result) {
        if (err) {
            console.error('Redis error:', err);
            return renderWithLocals({
                title: 'Change Password',
                error: 'Database error occurred. Please try again.',
                success: null
            });
        }

        const currentHash = result[0];
        if (!currentHash) {
            return renderWithLocals({
                title: 'Change Password',
                error: 'User not found.',
                success: null
            });
        }

        // Verify current password
        if (!bcrypt.compareSync(currentPassword, currentHash)) {
            return renderWithLocals({
                title: 'Change Password',
                error: 'Current password is incorrect.',
                success: null
            });
        }

        // Hash new password
        const newHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(saltRounds));

        // Update password in Redis
        databaseManager.getRedisCluster().hmset(`users:${username}`, 'password', newHash, function(err) {
            if (err) {
                console.error('Redis error updating password:', err);
                return renderWithLocals({
                    title: 'Change Password',
                    error: 'Failed to update password. Please try again.',
                    success: null
                });
            }

            renderWithLocals({
                title: 'Change Password',
                error: null,
                success: 'Password changed successfully!'
            });
        });
    });
});

module.exports = router;