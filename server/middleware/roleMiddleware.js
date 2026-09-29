/**
 * Role-based authorization middleware
 * @param  {...string|string[]} roles - Allowed role(s) e.g. 'admin' or ['student']
 */
const requireRole = (...roles) => {
  const flatRoles = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to role verification.',
      });
    }

    if (!flatRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires ${flatRoles.join(' or ')} privilege.`,
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};
