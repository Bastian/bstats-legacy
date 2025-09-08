const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const databaseManager = require("../util/databaseManager");
const dataManager = require("../util/dataManager");
const async = require("async");

const saltRounds = 10;
const RESET_TOKEN_EXPIRY_DAYS = 7;
const RESET_TOKEN_EXPIRY_MS = RESET_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const RESET_TOKEN_EXPIRY_SECONDS = RESET_TOKEN_EXPIRY_DAYS * 24 * 60 * 60; // 7 days in seconds (for Redis TTL)

// Generate secure random token
function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Admin-only middleware
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.admin) {
    return next();
  }
  // Set template locals before rendering error
  res.locals.allSoftware = [];
  res.locals.myPlugins = [];
  res.status(403).render("error", {
    message: "Access Denied",
    error: { status: 403, message: "Admin access required" },
  });
}

// Helper function to set required template locals
function setTemplateLocals(req, res, callback) {
  async.parallel(
    [
      function (cb) {
        dataManager.getAllSoftware(["name", "url", "globalPlugin"], cb);
      },
      function (cb) {
        if (req.user !== undefined) {
          dataManager.getPluginsOfUser(
            req.user.username,
            ["name", "software"],
            cb
          );
        } else {
          cb(null, []);
        }
      },
    ],
    function (err, results) {
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
    }
  );
}

// POST /admin/generate-reset-link - Generate password reset link (admin only)
router.post(
  "/admin/generate-reset-link",
  ensureAdmin,
  function (req, res, next) {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const userKey = `users:${username.toLowerCase()}`;

    // Check if user exists
    databaseManager
      .getRedisCluster()
      .hexists(userKey, "name", function (err, exists) {
        if (err) {
          console.error("Redis error:", err);
          return res.status(500).json({
            success: false,
            message: "Database error occurred",
          });
        }

        if (!exists) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const expiry = Date.now() + RESET_TOKEN_EXPIRY_MS;

        // Store reset token in Redis
        const tokenKey = `password_reset:${resetToken}`;
        databaseManager.getRedisCluster().hmset(
          tokenKey,
          {
            username: username.toLowerCase(),
            expiry: expiry,
            created_by: req.user.username,
            created_at: Date.now(),
          },
          function (err) {
            if (err) {
              console.error("Redis error storing token:", err);
              return res.status(500).json({
                success: false,
                message: "Failed to generate reset token",
              });
            }

            // Set expiration on the token key
            databaseManager
              .getRedisCluster()
              .expire(tokenKey, RESET_TOKEN_EXPIRY_SECONDS, function (err) {
                if (err) {
                  console.error("Redis error setting expiry:", err);
                }

                const resetLink = `${req.protocol}://${req.get(
                  "host"
                )}/reset-password?token=${resetToken}`;

                res.json({
                  success: true,
                  resetLink: resetLink,
                  token: resetToken,
                  expiresIn: `${RESET_TOKEN_EXPIRY_DAYS} days`,
                });
              });
          }
        );
      });
  }
);

// GET /reset-password - Show password reset form
router.get("/reset-password", function (req, res, next) {
  const { token } = req.query;

  function renderWithLocals(templateData) {
    setTemplateLocals(req, res, function (err) {
      if (err) {
        return next(err);
      }
      res.render("passwordReset", templateData);
    });
  }

  if (!token) {
    return renderWithLocals({
      title: "Reset Password",
      error: "Invalid or missing reset token.",
      success: null,
      token: null,
    });
  }

  const tokenKey = `password_reset:${token}`;

  // Check if token exists and is valid
  databaseManager
    .getRedisCluster()
    .hmget(tokenKey, ["username", "expiry"], function (err, result) {
      if (err) {
        console.error("Redis error:", err);
        return renderWithLocals({
          title: "Reset Password",
          error: "Database error occurred.",
          success: null,
          token: null,
        });
      }

      if (!result[0]) {
        return renderWithLocals({
          title: "Reset Password",
          error: "Invalid or expired reset token.",
          success: null,
          token: null,
        });
      }

      const username = result[0];
      const expiry = parseInt(result[1]);

      if (Date.now() > expiry) {
        // Token expired, clean it up
        databaseManager.getRedisCluster().del(tokenKey);
        return renderWithLocals({
          title: "Reset Password",
          error: "Reset token has expired. Please request a new one.",
          success: null,
          token: null,
        });
      }

      // Token is valid, show reset form
      renderWithLocals({
        title: "Reset Password",
        error: null,
        success: null,
        token: token,
        username: username,
      });
    });
});

// POST /reset-password - Handle password reset
router.post("/reset-password", function (req, res, next) {
  const { token, newPassword, confirmPassword } = req.body;

  function renderWithLocals(templateData) {
    setTemplateLocals(req, res, function (err) {
      if (err) {
        return next(err);
      }
      res.render("passwordReset", templateData);
    });
  }

  if (!token || !newPassword || !confirmPassword) {
    return renderWithLocals({
      title: "Reset Password",
      error: "All fields are required.",
      success: null,
      token: token || null,
    });
  }

  if (newPassword !== confirmPassword) {
    return renderWithLocals({
      title: "Reset Password",
      error: "Passwords do not match.",
      success: null,
      token: token,
    });
  }

  if (newPassword.length < 6) {
    return renderWithLocals({
      title: "Reset Password",
      error: "Password must be at least 6 characters long.",
      success: null,
      token: token,
    });
  }

  const tokenKey = `password_reset:${token}`;

  // Verify token
  databaseManager
    .getRedisCluster()
    .hmget(tokenKey, ["username", "expiry"], function (err, result) {
      if (err) {
        console.error("Redis error:", err);
        return renderWithLocals({
          title: "Reset Password",
          error: "Database error occurred.",
          success: null,
          token: token,
        });
      }

      if (!result[0]) {
        return renderWithLocals({
          title: "Reset Password",
          error: "Invalid or expired reset token.",
          success: null,
          token: null,
        });
      }

      const username = result[0];
      const expiry = parseInt(result[1]);

      if (Date.now() > expiry) {
        // Token expired, clean it up
        databaseManager.getRedisCluster().del(tokenKey);
        return renderWithLocals({
          title: "Reset Password",
          error: "Reset token has expired. Please request a new one.",
          success: null,
          token: null,
        });
      }

      // Hash new password
      const newHash = bcrypt.hashSync(
        newPassword,
        bcrypt.genSaltSync(saltRounds)
      );

      // Update password in Redis
      const userKey = `users:${username}`;
      databaseManager
        .getRedisCluster()
        .hmset(userKey, "password", newHash, function (err) {
          if (err) {
            console.error("Redis error updating password:", err);
            return renderWithLocals({
              title: "Reset Password",
              error: "Failed to update password. Please try again.",
              success: null,
              token: token,
            });
          }

          // Delete the used token
          databaseManager.getRedisCluster().del(tokenKey, function (err) {
            if (err) {
              console.error("Redis error deleting token:", err);
            }

            renderWithLocals({
              title: "Reset Password",
              error: null,
              success:
                "Password reset successfully! You can now log in with your new password.",
              token: null,
            });
          });
        });
    });
});

module.exports = router;
