const db = require('../db/db');
const User = db.models.users;
const LocalStrategy = require('passport-local').Strategy;

const strategy = new LocalStrategy(
	{
		usernameField: 'email' // not necessary, DEFAULT
	},
	async function(email, password, done) {
		try {
			const getuser = await User.findOne(
				{ where: {
						email: email
					}
				});
				if (!getuser) {
					return done(null, false, { message: 'Incorrect email' });
				}


				return done(null, getuser.dataValues);
		} catch (e) {
			return done(e);
		}
	}
)

module.exports = strategy
