# Arguments:
# 1. Name of Docker image to build
# 2. API token for Discord bot
set -x
npm install
npm build

rsync -r --delete-after --quiet $TRAVIS_BUILD_DIR/dst $TRAVIS_BUILD_DIR/node_modules Dockerfile root@108.61.198.106:~/bots/teamo-master

ssh root@108.61.198.106 "cd ~/bots/$1 ; docker build -t $1 . ; docker stop $1-instance || true && docker rm $1-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$1 ; docker stop $1-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$1 ; docker rm $1-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$1 ; docker run -e BOT_TOKEN=$2 --name $1-instance -d $1"
