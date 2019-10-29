# Arguments:
# 1. Name of Docker image to build
# 2. API token for Discord bot

npm build

docker build -t $1 .

docker stop $1-instance || true && docker rm $1-instance || true

docker run -e "BOT_TOKEN=$2" --name $1-instance -d $1
