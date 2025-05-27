import passport from "passport";
import Strategy from "passport-google-oauth2";
import { env } from ".";
import { config } from "dotenv";
config();

const clientID = env('')!;
const clientSecret = env('')!;
const callbackURL = env('')!;

passport.serializeUser((user, done) => {
    done(null, user);
})
passport.deserializeUser(function (user: any, done) {
    done(null, user);
});

passport.use(new Strategy.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
    passReqToCallback: true
},
    function (request: any, accessToken: any, refreshToken: any, profile: any, done: any) {
        return done(null, profile);
    }
));

export default passport;