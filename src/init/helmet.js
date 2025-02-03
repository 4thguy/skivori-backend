require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL;
const BACKEND_URL = process.env.BACKEND_URL;

const helmet = require('helmet');

function initHelmet(app) {
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],  // ✅ Only allow requests from the same origin
                scriptSrc: ["'self'", FRONTEND_URL],
                styleSrc: [
                    "'self'",
                ],
                imgSrc: ["'self'", "data:", FRONTEND_URL],
                connectSrc: ["'self'", FRONTEND_URL, BACKEND_URL],
                frameSrc: ["'none'"], // ✅ Prevents clickjacking
                upgradeInsecureRequests: [],
            },
        },
        referrerPolicy: { policy: "no-referrer" },  // ✅ Improves privacy
        frameguard: { action: "deny" },  // ✅ Blocks clickjacking attacks
        hidePoweredBy: true,  // ✅ Hides Express from attackers
        xssFilter: true,  // ✅ Protects against XSS attacks
        noSniff: true,  // ✅ Prevents MIME-type sniffing
    }));
}

module.exports = initHelmet; 