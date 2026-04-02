# AGENTS.md

## Cursor Cloud specific instructions

This repository contains the **湖南数据要素平台系统** (Hunan Data Element Platform), a full-stack application with:

### Project Structure
- `data-element-mgr/` — Spring Boot 3.4.3 backend (port 18081)
- `data-element-mgr-ui/` — React 19 + Vite frontend (port 3001)

### System Dependencies
- **JDK 17**: Must be set as default (`update-alternatives --set java /usr/lib/jvm/java-17-openjdk-amd64/bin/java`)
- **Maven 3.8+**: For backend builds
- **Node.js 22+** / **pnpm**: For frontend builds
- **MySQL 8**: Run via Docker: `sudo docker run -d --name mysql-dev -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=data_element_platform mysql:8.0`
- **Docker**: Required for MySQL. In Cloud Agent VMs, use `fuse-overlayfs` storage driver and `iptables-legacy`.

### Running Services

**Backend** (requires MySQL running on localhost:3306):
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
cd data-element-mgr && mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Frontend**:
```bash
cd data-element-mgr-ui && pnpm dev
```

### Important Caveats
- Spring Cloud Alibaba 2023.0.1.2 is used with Spring Boot 3.4.3, which requires `spring.cloud.compatibility-verifier.enabled=false` in `application.yml`.
- Nacos discovery is disabled by default (`NACOS_ENABLED=false`). Enable it only when Nacos server is available.
- SSO login requires access to internal SSO server (172.16.81.220:9000). For local development, set a cookie manually: `document.cookie = "access_token=test-token; path=/"`
- Database tables are auto-created on startup via `spring.sql.init.mode=always` with `CREATE TABLE IF NOT EXISTS`.

### Lint / Test / Build Commands

| Project | Lint | Build | Test |
|---------|------|-------|------|
| Backend | `mvn compile` | `mvn package -DskipTests` | `mvn test` |
| Frontend | `pnpm lint` | `pnpm build` | `pnpm lint && pnpm build` (no unit tests yet) |
