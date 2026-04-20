// ============================================================
// CinemaPlus - Performance Monitor
// Lightweight performance tracking for API routes
// ============================================================

interface PerfMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerfMetric[] = [];
  private maxMetrics: number = 1000;

  async measure<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      this.record(name, performance.now() - start, metadata);
      return result;
    } catch (error) {
      this.record(name, performance.now() - start, { ...metadata, error: true });
      throw error;
    }
  }

  record(name: string, duration: number, metadata?: Record<string, unknown>): void {
    this.metrics.push({ name, duration, timestamp: Date.now(), metadata });
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getAverage(name: string): { avg: number; min: number; max: number; count: number } {
    const relevant = this.metrics.filter(m => m.name === name);
    if (relevant.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
    const durations = relevant.map(m => m.duration);
    return {
      avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      min: Math.round(Math.min(...durations)),
      max: Math.round(Math.max(...durations)),
      count: durations.length,
    };
  }

  getSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const names = [...new Set(this.metrics.map(m => m.name))];
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    for (const name of names) {
      summary[name] = this.getAverage(name);
    }
    return summary;
  }

  getSlowest(limit = 10): PerfMetric[] {
    return [...this.metrics].sort((a, b) => b.duration - a.duration).slice(0, limit);
  }

  getRecent(limit = 50): PerfMetric[] {
    return this.metrics.slice(-limit);
  }

  clear(): void {
    this.metrics = [];
  }
}

export const perfMonitor = new PerformanceMonitor();
