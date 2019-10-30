# Arguments:
# 1. Name of Docker image to build
# 2. API token for Discord bot

npm build

rsync -r --delete-after --quiet $TRAVIS_BUILD_DIR/dst $TRAVIS_BUILD_DIR/node_modules root@108.61.198.106:~/bots/teamo-master

ssh root@108.61.198.106 'docker build -t $1 .'

ssh root@108.61.198.106 'docker stop $1-instance || true && docker rm $1-instance || true'

ssh root@108.61.198.106 'docker run -e BOT_TOKEN=$2 --name $1-instance -d $1'
