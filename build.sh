#!/usr/bin/env bash

if [[ ${TRAVIS_BRANCH} != 'develop' && ${TRAVIS_BRANCH} != 'master' && ${TRAVIS_BRANCH} != 'gh-pages' ]]; then
  exit 0
fi

# Set identity
git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis"

if [ ${TRAVIS_BRANCH} == 'gh-pages' ]; then
  git clone --branch gh-pages --depth 1 \
      https://${GH_TOKEN}@github.com/elboletaire/password-strength-meter.git \
      ../code
fi

if [[ ${TRAVIS_BRANCH} == 'develop' || ${TRAVIS_BRANCH} == 'gh-pages']]; then
  # generate minified file via gulp
  ./node_modules/.bin/gulp
fi

git clone --branch gh-pages --depth 1 \
    https://${GH_TOKEN}@github.com/elboletaire/password-strength-meter.git \
    ../gh-pages

cd ../gh-pages/

# Init project
git clone --branch gh-pages --depth 1 \
    https://${GH_TOKEN}@github.com/elboletaire/password-strength-meter.git \
    ../gh-pages

cd ../gh-pages/

# Push generated files
git add .
git commit -m "API updated"
git push origin gh-pages -q > /dev/null
