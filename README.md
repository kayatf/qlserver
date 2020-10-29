# QLServer 🏷
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> LDAP authenticated microservice for Brother QL-series label printers.

## Prerequisites

- [Git](https://git-scm.com/) (recommended)
- [NodeJs](https://nodejs.org/download/) (12+ recommended)
- [Python 3](https://www.python.org/downloads/) (3.2+ recommended)

## Install

- Install [brother_ql](https://pypi.org/project/brother-ql/) driver: 

    `python -m pip install --upgrade pip brother_ql`
- Clone or [download](https://github.com/rescaux/qlserver/archive/master.zip) the repository:

    `git clone https://github.com/rescaux/qlserver qlserver/`
- Change directory: 
    
    `cd qlserver/`
- Create and edit [configuration](https://github.com/rescaux/qlserver/blob/master/.example.env):

    - `cp .example.env .env`
    
    - `nano .env` (Save with CTRL + X + Y + ENTER)
- Install dependencies

    `npm install`
- Compile sources

    `npm run bundle`

## Execute

```sh
# Run
npm run daemon:start

# Stop
npm run daemon:stop
```

## Author

👤 **Riegler Daniel**

* Website: https://dani.wtf
* Github: [@rescaux](https://github.com/rescaux)

## License

Copyright © 2020 [Riegler Daniel](https://github.com/rescaux)

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT)

***
