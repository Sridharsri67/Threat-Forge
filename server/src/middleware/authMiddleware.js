// Simple auth middleware for SOC analyst actions
exports.protect = (req, res, next) => {
    // For demo/development purposes, we allow requests without strict auth
    // But we check for x-analyst-name to audit who is making changes
    const analystName = req.headers["x-analyst-name"];
    
    req.user = {
        name: analystName || "Default Analyst",
        role: "SOC Analyst"
    };

    next();
};
