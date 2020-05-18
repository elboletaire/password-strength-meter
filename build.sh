#!/usr/bin/env bash

if [ ${CI_BUILD_REF_NAME} != 'master' ]; then
  exit 0
fi

# Set identity
git config --global user.email "elboletaire+psm@gmail.com"
git config --global user.name "CI"

# Update dist files
yarn gulp clean
yarn gulp

# Change remote
git remote remove origin
git remote add origin https://${GH_TOKEN}@github.com/elboletaire/password-strength-meter.git
git fetch origin
# Ensure we're not on a detached branch
git checkout master
# Commit and push
git add -f dist
git commit -m "Update dist files [skip ci]"
git push origin master

# prepare gh-pages
git clone --branch gh-pages --depth 1 \
    https://${GH_TOKEN}@github.com/elboletaire/password-strength-meter.git \
    ../gh-pages

# remove all its content
rm -frv ../gh-pages/*
# copy what we want
cp -frv dist/* ../gh-pages

cd ../gh-pages/

# Push generated files
git add .
git commit -m "Update gh-pages [skip ci]"
git push origin gh-pages
