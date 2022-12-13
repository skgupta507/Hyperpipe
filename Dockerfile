FROM node:latest AS build

WORKDIR /app/

COPY . .

RUN --mount=type=cache,target=/root/.cache/node \
    --mount=type=cache,target=/app/node_modules \
    npm install --prefer-offline && \
    npm run build

FROM nginx:latest

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
