# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
COPY prisma/ ./prisma/
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S -G nodejs -s /bin/sh
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY --from=builder /app/build/ ./build/
COPY --from=builder /app/node_modules/@prisma/client/ ./node_modules/@prisma/client/
COPY --from=builder /app/prisma/ ./prisma/
RUN mkdir -p logs uploads plugins && chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const req=http.request({hostname:'localhost',port:3000,path:'/health',method:'GET'},(res)=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.end();"
CMD ["node", "build/index.js"]
</arg_value>
<task_progress>
- [x] Stop running server
- [x] Create new project structure following Clean Architecture
- [x] Update package.json with modern dependencies
- [x] Create tsconfig.json
- [x] Create .env.example
- [x] Create .eslintrc.json
- [x] Create .prettierrc
- [x] Create .gitignore
- [ ] Create configuration files
- [ ] Implement core infrastructure (config, logger, events, cache)
- [ ] Implement database layer with Prisma
- [ ] Implement authentication and security
- [ ] Implement tool system with dynamic registration
- [ ] Implement resource system
- [ ] Implement prompt system
- [ ] Implement plugin system
- [ ] Implement existing tools (patches, modules, practices, web search)
- [ ] Implement CLI
- [ ] Create Docker configuration
- [ ] Add tests
- [ ] Update documentation
</task_progress>
</write_to_file></tool_call>