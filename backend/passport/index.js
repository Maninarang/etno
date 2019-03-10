const config = require('config');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const db = require('../db/db');
const User = db.models.users;
const opts = {};

opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.jwtToken;

module.exports = passport => {
	passport.use(new JWTStrategy(opts, async (jwt_payload, done) => {
		try {
			const getuser = await User.findOne(
				{
					where: {
						id: jwt_payload.id,
						email: jwt_payload.email
					}
				});

			if (getuser) {
				return done(null, getuser.dataValues);
			}

			return done(null, false);
		} catch (e) {
			console.log('not local');
			console.error(e);
		}
	}));
}