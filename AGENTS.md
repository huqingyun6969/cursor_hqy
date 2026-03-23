## Cursor Cloud specific instructions

### Project Overview

This is a **LiteFlow-based data quality rule engine** microservice with:
- **Backend**: Spring Boot 3.4.3 + LiteFlow 2.15.3.2 + MyBatis-Plus 3.5.9 + MySQL 8
- **Frontend**: React 18 + Ant Design 5 + Vite (TypeScript)

### Services

| Service | Port | Command | Directory |
|---------|------|---------|-----------|
| Backend (Spring Boot) | 8080 | `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn spring-boot:run` | `rule-engine/` |
| Frontend (Vite dev) | 3000 | `npm run dev` | `rule-engine-ui/` |
| MySQL 8 | 3306 | `sudo mysqld --user=mysql --daemonize` | - |

### Prerequisites

- **JDK 17** (must set `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64` before running Maven)
- **Maven 3.8+**
- **MySQL 8** running on localhost:3306, database: `rule_engine`, user: `rule_engine` / `rule_engine123`
- **Node.js 18+** for the frontend

### Key Gotchas

- **LiteFlow `rule-source`**: Must be set to empty string `""` in `application.yml` (not null or empty map). Using null or map syntax causes a binding error at startup.
- **MyBatis-Plus 3.5.9**: Requires the separate `mybatis-plus-jsqlparser` dependency for `PaginationInnerInterceptor` to resolve. This was split into a separate module in 3.5.9.
- **LiteFlow dynamic execution**: Use `flowExecutor.execute2RespWithEL(chainEl, param, tag, contextBeans...)` for dynamic EL chain execution. The `execute2Resp()` method does NOT accept EL expressions.
- **Frontend proxy**: Vite dev server on port 3000 proxies `/api/*` to backend on port 8080.
- **Database init**: Run `schema.sql` to create tables: `sudo mysql -u root rule_engine < rule-engine/src/main/resources/schema.sql`

### Build & Test

- Backend compile: `cd rule-engine && mvn compile`
- Backend test: `cd rule-engine && mvn test`
- Frontend type check: `cd rule-engine-ui && npx tsc --noEmit`
- Frontend build: `cd rule-engine-ui && npm run build`
