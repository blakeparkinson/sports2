sports
======

RIP OG Sportsv1. It got all messed up. This one is new and improved

To Run in production-mode do in the home dir "export NODE_ENV=production" to set back to development "export NODE_ENV=development" development is the default

To run mocha tests do "npm test"

Installing redis:

1. ```Brew install redis```.
2. Fire it up: ```redis-server```
3. Check if it is working: ```redis-cli ping```. See if redis says PONG back.


Deployment:

1. Set app to production mode: ```heroku config:set NODE_ENV=production```
2. Add the buildpack: ```heroku config:set BUILDPACK_URL=https://github.com/blakeparkinson/heroku-buildpack-nodejs-gulp-bower```
3. Do the usual heroku deployment steps.