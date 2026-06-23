FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist .
EXPOSE 3000
CMD ["serve", "-s", ".", "-l", "3000"]# force rebuild Tue Jun 23 22:31:08 EAT 2026
