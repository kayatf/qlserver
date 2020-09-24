const { cleanEnv, str, url, host, port, bool } = require('envalid');

module.exports = cleanEnv(process.env, {
    HOST: host({
        default: '127.0.0.1',
        example: '192.168.0.2',
        desc: 'Host the HTTP/s server will bind to'
    }),
    PORT: port({
        default: '1312',
        example: '80',
        desc: 'Port the HTTP/S server will bind to'
    }),
    ENCRYPT: bool({
        default: false,
        example: true,
        desc: 'Should HTTPS be used (certificate has to be set up for this)',
    }),
    CERTIFICATE: str({
        default: '',
        example: 'server.crt',
        desc: 'Certificate file used to encrypt HTTPS traffic'
    }),
    PRIVATE_KEY: str({
        default: '',
        example: 'server.key',
        desc: "Certificate's private key used to encrypt HTTPS traffic"
    }),
    LDAP_URL: url({
        example: 'ldap://my.domain.com',
        desc: 'URL of the Active Directory server'
    }),
    LDAP_BASEDN: str({
        example: 'DC=my,DC=domain,DC=com',
        desc: 'Base Directory Name in which the server will search for users',
    }),
    LDAP_USER: str({
        example: 'bind@my.domain.com',
        desc: 'Active Directory system user'
    }),
    LDAP_PASSWORD: str({
        example: '12345678',
        desc: 'Active Directory system user password'
    }),
    PRINTER: str({
        example: 'QL-700',
        desc: 'Model name of the label printer to use',
        docs: 'https://github.com/pklaus/brother_ql',
        choices: [
            'QL-500',
            'QL-550',
            'QL-560',
            'QL-570',
            'QL-580N',
            'QL-650TD',
            'QL-700',
            'QL-710W',
            'QL-720NW',
            'QL-800',
            'QL-810W',
            'QL-820NWB',
            'QL-1050',
            'QL-1060N'
        ]
    }),
    LABEL_DIMENSIONS: str({
        example: '29x90',
        desc: 'Dimensions of the label in millimeters',
        docs: 'https://github.com/pklaus/brother_ql',
        choices: [
            '17x54',
            '17x87',
            '23x23',
            '29x42',
            '29x90',
            '39x90',
            '39x48',
            '52x29',
            '62x29',
            '62x100',
            '102x51',
            '102x152'
        ]
    })
});