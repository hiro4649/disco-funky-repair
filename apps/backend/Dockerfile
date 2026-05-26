FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS final

WORKDIR /app

ENV PORT=5000
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
