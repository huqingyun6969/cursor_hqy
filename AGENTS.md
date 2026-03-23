## Cursor Cloud specific instructions

### Project Overview

This is a **数据要素平台-规则引擎** (Data Element Platform - Rule Engine) based on LiteFlow, supporting data quality validation against MySQL, Oracle, and Hive data sources.

- **Backend**: Spring Boot 3.4.3 + LiteFlow 2.15.3.2 + MyBatis-Plus 3.5.9 + MySQL 8 + Flowable 7 + PowerJob 5.x
- **Frontend**: React 19 + Ant Design 6 + Vite 8 (TypeScript)

### Services

| Service | Port | Command | Directory |
|---------|------|---------|-----------|
| Backend (Spring Boot) | 8080 | `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Djava.net.preferIPv4Stack=true"` | `data-element-engine/` |
| Frontend (Vite dev) | 3000 | `npm run dev` | `data-element-ui/` |
| MySQL 8 | 3306 | `sudo mysqld --user=mysql --daemonize` | - |
| MySQL port forward | 33306 | `sudo socat TCP-LISTEN:33306,fork,reuseaddr TCP:127.0.0.1:3306 &` | - |

### Prerequisites

- **JDK 17** (must set `JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64` before running Maven)
- **Maven 3.8+**
- **MySQL 8** running on localhost:3306. The app targets port **33306** via socat port-forward.
- **Node.js 18+** for the frontend

### Database Setup

```bash
# Start MySQL
sudo mysqld --user=mysql --daemonize

# Port forward 33306 → 3306
sudo socat TCP-LISTEN:33306,fork,reuseaddr TCP:127.0.0.1:3306 &

# Set root password if needed
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root'; FLUSH PRIVILEGES;"

# Create database and run schema
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS data_element_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -proot -h 127.0.0.1 -P 33306 data_element_platform < data-element-engine/src/main/resources/schema.sql
```

Note: `schema.sql` doesn't contain all tables. The following tables need to be created manually: `execution_task`, `execution_step_log`, `execution_violation`, `rule_type_config`, `rule_chain`, `execution_sub_task`. See the entity classes for column definitions.

### Key Gotchas

- **LiteFlow `rule-source`**: Must be set to empty string `""` in `application.yml`. Using null or map syntax causes a binding error at startup.
- **IPv4 required for Java**: `localhost` resolves to IPv6 `::1` but MySQL binds to IPv4 only. Pass `-Djava.net.preferIPv4Stack=true` when running Spring Boot.
- **Flowable schema**: Auto-creates ACT_*/FLW_* tables on first startup. The `data_element_platform` database must exist first.
- **PowerJob**: Excluded from auto-config by default (`powerjob.enabled=false`). Set to `true` and provide server address to enable. Without a running PowerJob server, the app will fail to start if auto-config is not excluded.
- **Frontend lint**: Pre-existing `@typescript-eslint/no-explicit-any` errors and `react-hooks/exhaustive-deps` warnings. Not blockers.
- **rule_group table**: Has `table_name` and `table_label` columns that are not in the original `schema.sql`. Must be added manually.

### Build & Test

- Backend compile: `cd data-element-engine && JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn compile`
- Backend test: `cd data-element-engine && JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 mvn test`
- Frontend type check: `cd data-element-ui && npx tsc --noEmit`
- Frontend lint: `cd data-element-ui && npm run lint`
- Frontend build: `cd data-element-ui && npm run build`
