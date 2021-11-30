#!/usr/bin/env bash
apt-get update

apt-get -y install bash

curl -sL https://deb.nodesource.com/setup_16.x | bash -
apt install -y nodejs

cd /autograder/source
npm install --only=prod