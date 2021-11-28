#!/usr/bin/env bash
apt-get update

apt-get -y install bash

curl -sL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs
apt install -y npm
npm install npm@latest -g

cd /autograder/source
npm install --only=prod