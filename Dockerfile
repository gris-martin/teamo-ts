FROM node:13.0.1-alpine

COPY dst dst
COPY node_modules node_modules

CMD ["node", "dst/index.js"]
