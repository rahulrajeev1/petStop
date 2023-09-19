const jwt = require('jsonwebtoken');
require("dotenv").config()

function authenticateAdmin(req, res, next) {
    const token = req.cookies.adminToken;

    if (!token) {
        return res.status(401).render("admin/adminLogin"); // No token found, user is not authenticated
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.admin = decoded; // Attach the decoded admin data to the request object
        next(); // Move to the next middleware or route handler
    } catch (error) {
        return res.status(401).send('Unauthorized'); // Token is invalid, user is not authenticated
    }
}


// Middleware to check if an admin is logged in
function checkAdminLoggedIn(req, res, next) {
    const adminToken = req.cookies.adminToken;

    if (adminToken) {
        return res.redirect('/admin/home'); // Redirect to admin home if admin is already logged in
    }

    next(); // Proceed to the next middleware or route handler
}

module.exports ={
    authenticateAdmin,
    checkAdminLoggedIn
}