# Arguments:
# 1. Name of Docker image to build
# 2. API token for Discord bot
set -x

npm install
npm run build

rsync -r --delete-after --quiet $TRAVIS_BUILD_DIR/dst $TRAVIS_BUILD_DIR/node_modules Dockerfile root@108.61.198.106:~/bots/$TRAVIS_BRANCH

ssh root@108.61.198.106 "cd ~/bots/$TRAVIS_BRANCH ; docker build -t $TRAVIS_BRANCH . ; docker stop $TRAVIS_BRANCH-instance || true && docker rm $TRAVIS_BRANCH-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$TRAVIS_BRANCH ; docker stop $TRAVIS_BRANCH-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$TRAVIS_BRANCH ; docker rm $TRAVIS_BRANCH-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$TRAVIS_BRANCH ; docker run -e BOT_TOKEN=$BOT_TOKEN --name $TRAVIS_BRANCH-instance -d $TRAVIS_BRANCH"
