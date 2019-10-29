# Arguments:
# 1. Name of Docker image to build
# 2. API token for Discord bot

npm build

docker build -t $1 .

docker run -e "BOT_TOKEN=$2" -d $1
