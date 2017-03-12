#!/usr/bin/env bash

if [ ${TRAVIS_BRANCH} != 'master' ]; then
  exit 0
fi

# Set identity
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis"
git config --global credential.helper cache

# prepare gh-pages + login
git clone --branch gh-pages --depth 1 \
    https://${GH_TOKEN}@github.com/elboletaire/password-strength-meter.git \
    ../gh-pages

# Update dist files
./node_modules/.bin/gulp clean
./node_modules/.bin/gulp

# Commit and push
git add -f dist
git commit -m "Update dist files [skip ci]"
git push origin master -q > /dev/null

# remove all its content
rm -frv ../gh-pages/*
# copy what we want
cp -frv dist/* ../gh-pages

cd ../gh-pages/

# Push generated files
git add .
git commit -m "Update gh-pages [skip ci]"
git push origin gh-pages -q > /dev/null
