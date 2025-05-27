import session from "express-session";
import { RedisStore } from "connect-redis";
import { redisClient } from ".";

export default session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 1000 * 60 * 60 * 24 // 1 day expiration (adjust as needed)
    }
});