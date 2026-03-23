package com.example.ruleengine.service;

import org.springframework.stereotype.Service;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ResourceMonitorService {

    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new LinkedHashMap<>();

        metrics.put("cpuUsage", getCpuUsage());
        metrics.put("cpuCores", Runtime.getRuntime().availableProcessors());

        MemoryMXBean mem = ManagementFactory.getMemoryMXBean();
        long heapUsed = mem.getHeapMemoryUsage().getUsed() / 1024 / 1024;
        long heapMax = mem.getHeapMemoryUsage().getMax() / 1024 / 1024;
        long nonHeapUsed = mem.getNonHeapMemoryUsage().getUsed() / 1024 / 1024;

        metrics.put("heapUsedMb", heapUsed);
        metrics.put("heapMaxMb", heapMax);
        metrics.put("heapUsagePct", heapMax > 0
                ? BigDecimal.valueOf(heapUsed * 100.0 / heapMax).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);
        metrics.put("nonHeapUsedMb", nonHeapUsed);

        long totalMem = Runtime.getRuntime().totalMemory() / 1024 / 1024;
        long freeMem = Runtime.getRuntime().freeMemory() / 1024 / 1024;
        metrics.put("jvmTotalMb", totalMem);
        metrics.put("jvmFreeMb", freeMem);

        File root = new File("/");
        long diskTotal = root.getTotalSpace() / 1024 / 1024;
        long diskFree = root.getFreeSpace() / 1024 / 1024;
        long diskUsed = diskTotal - diskFree;
        metrics.put("diskTotalMb", diskTotal);
        metrics.put("diskUsedMb", diskUsed);
        metrics.put("diskFreeMb", diskFree);
        metrics.put("diskUsagePct", diskTotal > 0
                ? BigDecimal.valueOf(diskUsed * 100.0 / diskTotal).setScale(1, RoundingMode.HALF_UP)
                : BigDecimal.ZERO);

        int threadCount = Thread.activeCount();
        metrics.put("activeThreads", threadCount);

        return metrics;
    }

    public BigDecimal getCpuUsage() {
        try {
            com.sun.management.OperatingSystemMXBean osBean =
                    (com.sun.management.OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
            double cpu = osBean.getProcessCpuLoad() * 100;
            return BigDecimal.valueOf(cpu).setScale(1, RoundingMode.HALF_UP);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    public long getUsedMemoryMb() {
        MemoryMXBean mem = ManagementFactory.getMemoryMXBean();
        return mem.getHeapMemoryUsage().getUsed() / 1024 / 1024;
    }

    public long getMaxMemoryMb() {
        return Runtime.getRuntime().maxMemory() / 1024 / 1024;
    }

    public double getMemoryUsagePct() {
        long used = getUsedMemoryMb();
        long max = getMaxMemoryMb();
        return max > 0 ? used * 100.0 / max : 0;
    }

    public boolean isOverloaded(int cpuThreshold, int memThreshold) {
        double cpu = getCpuUsage().doubleValue();
        double memPct = getMemoryUsagePct();
        return cpu >= cpuThreshold || memPct >= memThreshold;
    }
}
