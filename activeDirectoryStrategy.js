const Strategy = require('passport-activedirectory');
const { LDAP_URL, LDAP_BASEDN, LDAP_USER, LDAP_PASSWORD } = require('./env');

module.exports = new Strategy({
    integrated: false,
    credentials: 'include',
    ldap: {
        url: LDAP_URL,
        baseDN: LDAP_BASEDN,
        username: LDAP_USER,
        password: LDAP_PASSWORD
    }
}, (profile, ad, done) => ad.isUserMemberOf(
    profile._json.dn, 'AccessGroup', error => done(error, profile)
));