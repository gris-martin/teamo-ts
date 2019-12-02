# Arguments:
# 1. Name of Docker image to build
# 2. API token for Discord bot
set -x

branch=$(echo $TRAVIS_BRANCH | sed -e 's/\//-/g')

npm install
npm run build

rsync -r --delete-after --quiet $TRAVIS_BUILD_DIR/dst $TRAVIS_BUILD_DIR/node_modules Dockerfile root@108.61.198.106:~/bots/$branch

ssh root@108.61.198.106 "cd ~/bots/$branch ; docker build -t $branch ."
ssh root@108.61.198.106 "cd ~/bots/$branch ; docker stop $branch-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$branch ; docker rm $branch-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$branch ; docker run -e TEAMO_BOT_TOKEN=$TEAMO_BOT_TOKEN -e TEAMO_CHANNEL_ID=$TEAMO_CHANNEL_ID -e TZ=Europe/Stockholm --restart unless-stopped --name $branch-instance -d $branch"
