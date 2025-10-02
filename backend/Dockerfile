FROM node:22 AS builder

WORKDIR /app

COPY package*.json .npmrc ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

FROM node:22 AS runtime

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# 创建启动脚本
RUN echo '#!/bin/sh\n\
npm run prisma:generate\n\
npm run prisma:migrate:deploy\n\
npm run start:prod' > /app/start.sh && chmod +x /app/start.sh

CMD [ "/app/start.sh" ]
