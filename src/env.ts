/*
 *     ________________ __
 *    / ____/ ___/ ___// /____  __  _______
 *   / __/  \__ \\__ \/ __/ _ \/ / / / ___/
 *  / /___ ___/ /__/ / /_/  __/ /_/ / /
 * /_____//____/____/\__/\___/\__, /_/
 *                           /____/
 *
 * This file is licensed under The MIT License
 * Copyright (c) 2020 Riegler Daniel
 * Copyright (c) 2020 ESS Engineering Software Steyr GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {bool, cleanEnv, host, num, port, str, url} from 'envalid';

export default cleanEnv(process.env, {
  HOST: host({
    default: '127.0.0.1',
    example: '192.168.0.2',
    desc: 'Host the HTTP/s server will bind to',
  }),
  PORT: port({
    default: 1312,
    example: '80',
    desc: 'Port the HTTP/S server will bind to',
  }),
  PROXY: bool({
    default: false,
    desc:
      "Enable this option if you're running the app. behind a reverse proxy",
  }),
  POST_MAX_SIZE: num({
    default: 3,
    desc: 'Max. file size of request body',
  }),
  ENCRYPT: bool({
    default: false,
    desc: 'Should HTTPS be used (certificate has to be set up for this)',
  }),
  ENCRYPT_SECRET_LENGTH: num({
    default: 32,
    desc: 'Length of the cryptographic key used to encrypt sessions with',
  }),
  CERTIFICATE: str({
    default: '',
    example: 'server.crt',
    desc: 'Certificate file used to encrypt HTTPS traffic',
  }),
  PRIVATE_KEY: str({
    default: '',
    example: 'server.key',
    desc: "Certificate's private key used to encrypt HTTPS traffic",
  }),
  LDAP_URL: url({
    example: 'ldap://my.domain.com',
    desc: 'URL of the Active Directory server',
  }),
  LDAP_BIND_DN: str({
    example: 'bind@example.com',
    desc: 'Active directory bind account name',
  }),
  LDAP_BIND_CREDENTIAL: str({
    example: '12345678',
    desc: 'Active Directory bind account password',
  }),
  LDAP_SEARCH_BASE: str({
    example: 'OU=users,DC=example,DC=com',
    desc: 'Where to search for user accounts',
  }),
  LDAP_SEARCH_FILTER: str({
    example: '(&cn=*)',
    desc: 'How to filter user accounts',
  }),
  LDAP_SEARCH_ATTRIBUTES: str({
    example: 'displayName, mail',
    desc: 'Attributes used to filter user accounts',
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
      'QL-1060N',
    ],
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
      '102x152',
    ],
  }),
});
