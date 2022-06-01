FROM node:latest

ENV HOME=/apidoc
WORKDIR $HOME

RUN yarn global add apidoc

COPY package.json $HOME
ADD src $HOME/src
RUN yarn doc

FROM nginx:latest

ENV HOME=/apidoc
WORKDIR $HOME

COPY --from=0 /apidoc/apidoc apidoc

RUN rm -r /etc/nginx/conf.d && mkdir /etc/nginx/conf.d

COPY api-doc.conf /etc/nginx/conf.d

EXPOSE 80
