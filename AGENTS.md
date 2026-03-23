## Cursor Cloud specific instructions

### Project Overview

This is a **数据要素平台-规则引擎** (Data Element Platform - Rule Engine) based on LiteFlow, supporting data quality validation against MySQL, Oracle, and Hive data sources.

- **Backend**: Spring Boot 3.4.3 + LiteFlow 2.15.3.2 + MyBatis-Plus 3.5.9 + MySQL 8
- **Frontend**: React 18 + Ant Design 5 + Vite (TypeScript)

### Services

| Service | Port | Command | Directory |
|---------|------|---------|-----------|
| Backend (Spring Boot) | 8080 | `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn spring-boot:run` | `data-element-engine/` |
| Frontend (Vite dev) | 3000 | `npm run dev` | `data-element-ui/` |
| MySQL 8 | 3306 | `sudo mysqld --user=mysql --daemonize` | - |
| MySQL port forward | 33306 | `sudo socat TCP-LISTEN:33306,fork,reuseaddr TCP:127.0.0.1:3306 &` | - |

### Prerequisites

- **JDK 17** (must set `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64` before running Maven)
- **Maven 3.8+**
- **MySQL 8** running on localhost:3306. The app's `application.yml` currently targets port **33306** and database `data_element_platform` with `root`/`root`. A socat port-forward from 33306→3306 is needed.
- **Node.js 18+** for the frontend

### Supported Data Sources

The rule engine validates data in remote databases. The system's own metadata is in local MySQL, but the **target data** for validation can be in:
- **MySQL** — e.g. `jdbc:mysql://127.0.0.1:33306/zsmartcity_auth`
- **Oracle** — e.g. `jdbc:oracle:thin:@//host:1521/service_name`
- **Hive** — e.g. `jdbc:hive2://host:10000/database`

The JDBC driver is auto-detected from the URL prefix. No manual driver-class configuration is needed.

### Key Gotchas

- **LiteFlow `rule-source`**: Must be set to empty string `""` in `application.yml`. Using null or map syntax causes a binding error at startup.
- **MyBatis-Plus 3.5.9**: Requires the separate `mybatis-plus-jsqlparser` dependency for `PaginationInnerInterceptor`.
- **LiteFlow dynamic execution**: Use `flowExecutor.execute2RespWithEL(chainEl, param, tag, contextBeans...)` for dynamic EL chain execution.
- **Frontend proxy**: Vite dev server on port 3000 proxies `/api/*` to backend on port 8080.
- **Database init**: Run `schema.sql` to create tables: `mysql -u root -proot -h 127.0.0.1 -P 33306 data_element_platform < data-element-engine/src/main/resources/schema.sql`
- **IPv4 required for Java**: `localhost` resolves to IPv6 `::1` in this environment but MySQL binds to IPv4 only. When running Spring Boot directly with `java -jar`, pass `-Djava.net.preferIPv4Stack=true`. The Maven plugin handles this via `spring-boot.run.jvmArguments`.
- **Flowable schema**: Flowable auto-creates ACT_* and FLW_* tables on first startup (`database-schema-update: true`). The `data_element_platform` database must already exist.
- **Frontend lint**: `npm run lint` in `data-element-ui/` has pre-existing warnings/errors (react-hooks/exhaustive-deps, unused vars). These are not blockers.

### Build & Test

- Backend compile: `cd data-element-engine && mvn compile`
- Backend test: `cd data-element-engine && mvn test`
- Frontend type check: `cd data-element-ui && npx tsc --noEmit`
- Frontend build: `cd data-element-ui && npm run build`
