FROM node:lts-alpine AS build

WORKDIR /app/

COPY . .

RUN npm install && \
    npm run build

FROM nginx:lts-alpine

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
