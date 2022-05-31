FROM node:latest

ENV HOME=/backend
WORKDIR $HOME

COPY package.json $HOME
COPY yarn.lock $HOME
RUN yarn

COPY tsconfig.json $HOME
ADD src $HOME/src

EXPOSE 9000
