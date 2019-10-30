# Arguments:
# 1. Name of Docker image to build
# 2. API token for Discord bot
set -x

npm install
npm run build

rsync -r --delete-after --quiet $TRAVIS_BUILD_DIR/dst $TRAVIS_BUILD_DIR/node_modules Dockerfile root@108.61.198.106:~/bots/teamo-master
