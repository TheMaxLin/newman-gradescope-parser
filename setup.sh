#!/usr/bin/env bash
apt-get update

apt-get install -y bash

curl -sL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs

cd /autograder/source
npm install --only=prod