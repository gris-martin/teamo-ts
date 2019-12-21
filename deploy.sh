# Arguments:
# 1. Name of Docker image to build
# 2. API token for Discord bot
set -x

# npm install
# npm run build

rsync -r --delete-after --quiet $GITHUB_WORKSPACE/dst $GITHUB_WORKSPACE/node_modules Dockerfile root@108.61.198.106:~/bots/$branch

ssh root@108.61.198.106 "cd ~/bots/$DOCKER_NAME ; docker build -t $branch ."
ssh root@108.61.198.106 "cd ~/bots/$DOCKER_NAME ; docker stop $branch-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$DOCKER_NAME ; docker rm $branch-instance || true"
ssh root@108.61.198.106 "cd ~/bots/$DOCKER_NAME ; docker run -e TEAMO_BOT_TOKEN=$TEAMO_BOT_TOKEN -e TEAMO_CHANNEL_ID=$TEAMO_CHANNEL_ID -e TZ=Europe/Stockholm --restart unless-stopped --name $DOCKER_NAME-instance -d $DOCKER_NAME"
