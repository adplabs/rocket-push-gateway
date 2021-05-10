FROM node:14-alpine AS builder
# https://hub.docker.com/_/node/
LABEL Description="Rocket.chat Push Notification Gateway" Vendor="ADP Innovation Labs" Version="1.0"
ARG NODEJS_ORG_MIRROR=http://nodejs.org/dist
RUN apk upgrade --update \
 && apk add --no-cache --update ca-certificates openssh-client g++ git python make \
 && c_rehash /etc/ssl/certs \
 && rm -rf /var/cache/apk/*
ADD package*.json /app/
WORKDIR /app
RUN npm ci --only=production
ADD . /app

# Start over without any of the crap, so we get a lean container
FROM node:14-alpine
LABEL Description="Rocket.chat Push Notification Gateway" Vendor="ADP Innovation Labs" Version="1.0"
ARG no_proxy="localhost,.local,.internal,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
EXPOSE  11000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD /usr/bin/curl -f http://localhost:11000/healthcheck || exit 1
CMD [ "node", "app.js" ]
RUN apk upgrade --update \
 && apk add --no-cache --update ca-certificates curl \
 && c_rehash /etc/ssl/certs \
 && rm -rf /var/cache/apk/*
# Copy the app
COPY --from=builder /app /app
WORKDIR /app
ARG LOG_LEVEL
ARG NODE_ENV
ARG NODE_CONFIG
ARG BUILD_NUMBER
ARG GIT_COMMIT
ARG BRANCH_TAG
ARG TIMESTAMP
ARG TAGNAME
ENV BUILD_NUMBER=${BUILD_NUMBER}
ENV GIT_COMMIT=${GIT_COMMIT}
ENV BRANCH_TAG=${BRANCH_TAG}
ENV TIMESTAMP=${TIMESTAMP}
ENV TAGNAME=${TAGNAME}
USER node
