#!/usr/bin/env bash

if [ ${TRAVIS_BRANCH} != 'master' ]; then
  exit 0
fi

# Set identity
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis"

# prepare gh-pages
git clone --branch gh-pages --depth 1 \
    https://${GITHUB_TOKEN}@github.com/elboletaire/racotecnic.git \
    ../gh-pages

# remove all its content
rm -frv ../gh-pages/_site
# copy what we want
cp -frv _site ../gh-pages

cd ../gh-pages/

# Push generated files
git add .
git commit -m "Update gh-pages [skip ci]"
git push origin gh-pages
