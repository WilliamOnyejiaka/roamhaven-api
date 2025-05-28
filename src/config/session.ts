import session from "express-session";
import { RedisStore } from "connect-redis";
import { redisClient, env } from ".";

export default session({
    store: new RedisStore({ client: redisClient }),
    secret: env('sessionSecret')!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: env('envType')! === 'prod', // Use secure cookies in production
        maxAge: 1000 * 60 * 60 * 24 // 1 day expiration (adjust as needed)
    }
});