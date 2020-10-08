#!/bin/bash
#     ________________ __
#    / ____/ ___/ ___// /____  __  _______
#   / __/  \__ \\__ \/ __/ _ \/ / / / ___/
#  / /___ ___/ /__/ / /_/  __/ /_/ / /
# /_____//____/____/\__/\___/\__, /_/
#                           /____/
#
# This file is licensed under The MIT License
# Copyright (c) 2020 Riegler Daniel
# Copyright (c) 2020 ESS Engineering Software Steyr GmbH
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
#

SCRIPT_URL="https://raw.githubusercontent.com/rescaux/qlserver/master/ecosystem.config.js"

if [ "$EUID" -ne 0 ]; then
  echo "Please run with elevated privileges."
  exit 1
fi

if [[ -z "$(command -v curl)" ]]; then
  read -p "CURL is not found, do you want to install it now?" -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo apt -y install curl
  else
    exit 1
  fi
fi

if [[ -z "$(command -v npm)" ]]; then
  read -p "NodeJs is not found, do you want to install it now?" -n 1 -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
    sudo apt -y install nodejs
  else
    exit 1
  fi
fi

npm install --global pm2

SCRIPT_FILE=$(mktemp /tmp/ecosystem.config.js.XXXXXXXX)
curl $SCRIPT_URL >>"${SCRIPT_FILE}"

read -p "User: " user
read -p "Host: " host
read -p "Key: " key

cat <<EOT >>deploy.json
{
  "user": $user,
  "host:" $host,
  "key": $key
}
EOT

pm2 deploy $SCRIPT_FILE production setup
pm2 deploy $SCRIPT_FILE production --force

rm $SCRIPT_FILE
rm deploy.json
