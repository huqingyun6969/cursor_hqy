package com.example.ruleengine.service;

import com.example.ruleengine.domain.entity.DataSourceConfig;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DataSourcePoolManager {

    private static final Logger log = LoggerFactory.getLogger(DataSourcePoolManager.class);

    @Value("${engine.pool.max-size:10}")
    private int maxPoolSize;

    @Value("${engine.pool.min-idle:2}")
    private int minIdle;

    @Value("${engine.pool.idle-timeout:60000}")
    private long idleTimeout;

    @Value("${engine.pool.max-lifetime:300000}")
    private long maxLifetime;

    @Value("${engine.pool.connection-timeout:30000}")
    private long connectionTimeout;

    private final Map<String, HikariDataSource> pools = new ConcurrentHashMap<>();

    public JdbcTemplate getJdbcTemplate(DataSourceConfig ds) {
        String key = ds.getDbUrl() + "|" + ds.getDbUsername();
        HikariDataSource pool = pools.computeIfAbsent(key, k -> createPool(ds));
        return new JdbcTemplate(pool);
    }

    private HikariDataSource createPool(DataSourceConfig ds) {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(ds.getDbUrl());
        config.setUsername(ds.getDbUsername());
        config.setPassword(ds.getDbPassword());
        config.setDriverClassName(detectDriverClass(ds.getDbUrl()));
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        config.setConnectionTimeout(connectionTimeout);
        config.setPoolName("target-ds-" + ds.getId());
        log.info("Created connection pool for datasource {} ({})", ds.getName(), ds.getDbUrl());
        return new HikariDataSource(config);
    }

    public Map<String, Object> getPoolStats() {
        Map<String, Object> stats = new ConcurrentHashMap<>();
        pools.forEach((key, pool) -> {
            Map<String, Object> poolInfo = new ConcurrentHashMap<>();
            poolInfo.put("active", pool.getHikariPoolMXBean() != null ? pool.getHikariPoolMXBean().getActiveConnections() : 0);
            poolInfo.put("idle", pool.getHikariPoolMXBean() != null ? pool.getHikariPoolMXBean().getIdleConnections() : 0);
            poolInfo.put("total", pool.getHikariPoolMXBean() != null ? pool.getHikariPoolMXBean().getTotalConnections() : 0);
            poolInfo.put("waiting", pool.getHikariPoolMXBean() != null ? pool.getHikariPoolMXBean().getThreadsAwaitingConnection() : 0);
            poolInfo.put("poolName", pool.getPoolName());
            stats.put(pool.getPoolName(), poolInfo);
        });
        return stats;
    }

    @PreDestroy
    public void shutdown() {
        pools.values().forEach(pool -> {
            try { pool.close(); } catch (Exception e) { log.warn("Error closing pool: {}", e.getMessage()); }
        });
    }

    private String detectDriverClass(String jdbcUrl) {
        if (jdbcUrl == null) throw new RuntimeException("JDBC URL cannot be null");
        String url = jdbcUrl.toLowerCase();
        if (url.startsWith("jdbc:mysql:")) return "com.mysql.cj.jdbc.Driver";
        if (url.startsWith("jdbc:oracle:")) return "oracle.jdbc.OracleDriver";
        if (url.startsWith("jdbc:hive2:")) return "org.apache.hive.jdbc.HiveDriver";
        if (url.startsWith("jdbc:postgresql:")) return "org.postgresql.Driver";
        throw new RuntimeException("Unsupported JDBC URL: " + jdbcUrl);
    }
}
