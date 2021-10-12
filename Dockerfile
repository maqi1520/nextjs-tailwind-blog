# Install dependencies only when needed
FROM node:alpine AS builder

# Create app directory
WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/
# Install app dependencies
RUN yarn install --prefer-offline --frozen-lockfile

COPY . .

RUN npm run build

FROM node:alpine AS runner

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.next ./.next

EXPOSE 3000

CMD ["yarn", "start"]