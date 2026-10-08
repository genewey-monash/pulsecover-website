# PulseCover server (website + API + app download page). No dependencies to install.
FROM node:24-slim
WORKDIR /app
COPY . .
ENV PORT=3000
EXPOSE 3000
VOLUME /app/data
CMD ["node", "server.js"]
