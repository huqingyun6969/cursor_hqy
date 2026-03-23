## Cursor Cloud specific instructions

### Project Overview

This is a **数据要素平台-规则引擎** (Data Element Platform - Rule Engine) based on LiteFlow, supporting data quality validation against MySQL, Oracle, and Hive data sources. Package: `com.iwhalecloud.dep.runengine`.

- **Backend**: Spring Boot 3.4.3 + LiteFlow 2.15.3.2 + MyBatis-Plus 3.5.9 + MySQL 8 + Flowable 7 + PowerJob 5.x
- **Frontend**: React 19 + Ant Design 6 + Vite 8 (TypeScript)
- **All database tables** use `dep_` prefix (e.g. `dep_data_source_config`, `dep_rule_group`)

### Services

| Service | Port | Command | Directory |
|---------|------|---------|-----------|
| Backend (Spring Boot) | 8080 | `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Djava.net.preferIPv4Stack=true"` | `data-element-engine/` |
| Frontend (Vite dev) | 3000 | `npm run dev` | `data-element-ui/` |
| MySQL 8 | 3306 | `sudo mysqld --user=mysql --daemonize` | - |
| MySQL port forward | 33306 | `sudo socat TCP-LISTEN:33306,fork,reuseaddr TCP:127.0.0.1:3306 &` | - |

### Prerequisites

- **JDK 17** (must set `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64`)
- **Maven 3.8+**
- **MySQL 8** on localhost:3306, port-forwarded to 33306 via socat
- **Node.js 18+** for frontend

### Database Setup

The app uses `spring.sql.init.mode: always` to auto-create tables on startup. The database `data_element_platform` must exist first:
```bash
sudo mysqld --user=mysql --daemonize
sudo socat TCP-LISTEN:33306,fork,reuseaddr TCP:127.0.0.1:3306 &
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root'; FLUSH PRIVILEGES;"
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS data_element_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Key Gotchas

- **Package**: `com.iwhalecloud.dep.runengine` (not `com.example.ruleengine`)
- **Table prefix**: All tables use `dep_` prefix
- **DataSourceConfig no longer has tableName**: Target table is now configured in `RuleGroup.tableName` / `RuleGroup.querySql`
- **LiteFlow `rule-source`**: Must be empty string `""` in `application.yml`
- **IPv4 required**: Pass `-Djava.net.preferIPv4Stack=true` when running Spring Boot
- **PowerJob**: Excluded from auto-config by default. Set `powerjob.enabled=true` to enable
- **Dynamic scripts**: Supports JavaScript (GraalJS) and Java (javax-pro) script nodes via LiteFlow
- **Flowable**: Auto-creates ACT_*/FLW_* tables on first startup

### Build & Test

- Backend compile: `cd data-element-engine && JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn compile`
- Backend test: `cd data-element-engine && JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn test`
- Frontend type check: `cd data-element-ui && npx tsc --noEmit`
- Frontend lint: `cd data-element-ui && npm run lint`
