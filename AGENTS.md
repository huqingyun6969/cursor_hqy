# AGENTS.md

## Cursor Cloud specific instructions

This repository contains `data-element-mgr`, a Spring Boot 3.4.3 + MyBatis-Plus 3.5.9 backend (JDK 17, Maven).

### Build & run

- **Compile**: `mvn compile` (from `data-element-mgr/`)
- **Test**: `mvn test` (from `data-element-mgr/`)
- **Run**: `mvn spring-boot:run` (requires MySQL on localhost:3306, db `data_element_platform`, user/pass `root`/`root`)
- Nacos discovery is disabled by default (`NACOS_ENABLED=false`).

### Caveats

- MyBatis-Plus 3.5.9 moved `PaginationInnerInterceptor` to the `mybatis-plus-jsqlparser` artifact. The pom.xml needs that dependency for pagination to compile.
- The app expects MySQL; without it, `spring-boot:run` will fail at startup with a datasource error.
- No lint tool (Checkstyle/PMD) is currently configured; static analysis is limited to `mvn compile`.
