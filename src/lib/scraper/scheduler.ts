// ============================================================
// CinemaPlus - Scraper Scheduler
// Cron-based scheduler for automatic scraper execution
// Uses node-cron for scheduling
// ============================================================

import cron, { ScheduledTask } from "node-cron";
import { db } from "@/lib/db";
import { executeScraper } from "./engine";

// Store active scheduled tasks
const activeTasks: Map<string, ScheduledTask> = new Map();

/**
 * Initialize the scheduler - load all active scrapers and schedule them
 */
export async function initScheduler(): Promise<void> {
  try {
    const scrapers = await db.scraperConfig.findMany({
      where: { isActive: true },
    });

    for (const scraper of scrapers) {
      if (scraper.cronSchedule) {
        scheduleScraper(scraper.id, scraper.cronSchedule);
      }
    }

    console.log(`[SCRAPER_SCHEDULER] Initialized with ${activeTasks.size} active schedules`);
  } catch (error) {
    console.error("[SCRAPER_SCHEDULER] Initialization failed:", error);
  }
}

/**
 * Schedule a scraper with a cron expression
 */
export function scheduleScraper(scraperId: string, cronExpression: string): boolean {
  // Validate cron expression
  if (!cron.validate(cronExpression)) {
    console.error(`[SCRAPER_SCHEDULER] Invalid cron expression: ${cronExpression}`);
    return false;
  }

  // Remove existing task if any
  unscheduleScraper(scraperId);

  // Create new task
  const task = cron.schedule(cronExpression, async () => {
    console.log(`[SCRAPER_SCHEDULER] Running scraper: ${scraperId}`);
    try {
      await executeScraper(scraperId);
      console.log(`[SCRAPER_SCHEDULER] Completed scraper: ${scraperId}`);
    } catch (error) {
      console.error(`[SCRAPER_SCHEDULER] Error running scraper ${scraperId}:`, error);
    }
  });

  activeTasks.set(scraperId, task);
  console.log(`[SCRAPER_SCHEDULER] Scheduled scraper: ${scraperId} (${cronExpression})`);
  return true;
}

/**
 * Remove a scraper from the schedule
 */
export function unscheduleScraper(scraperId: string): void {
  const task = activeTasks.get(scraperId);
  if (task) {
    task.stop();
    activeTasks.delete(scraperId);
    console.log(`[SCRAPER_SCHEDULER] Unscheduled scraper: ${scraperId}`);
  }
}

/**
 * Get all active scheduled tasks
 */
export function getActiveSchedules(): string[] {
  return Array.from(activeTasks.keys());
}

/**
 * Stop all scheduled tasks (for cleanup)
 */
export function stopAllSchedules(): void {
  for (const [id, task] of activeTasks) {
    task.stop();
    console.log(`[SCRAPER_SCHEDULER] Stopped scraper: ${id}`);
  }
  activeTasks.clear();
}

/**
 * Validate a cron expression
 */
export function validateCron(expression: string): { valid: boolean; description?: string } {
  if (!cron.validate(expression)) {
    return { valid: false };
  }

  // Parse and describe the cron schedule
  const parts = expression.split(" ");
  if (parts.length !== 5) {
    return { valid: false };
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Common schedule descriptions
  const descriptions: Record<string, string> = {
    "0 * * * *": "كل ساعة",
    "0 */2 * * *": "كل ساعتين",
    "0 */4 * * *": "كل 4 ساعات",
    "0 */6 * * *": "كل 6 ساعات",
    "0 */12 * * *": "كل 12 ساعة",
    "0 0 * * *": "كل يوم عند منتصف الليل",
    "0 3 * * *": "كل يوم الساعة 3 صباحاً",
    "0 6 * * *": "كل يوم الساعة 6 صباحاً",
    "0 12 * * *": "كل يوم الساعة 12 ظهراً",
    "0 18 * * *": "كل يوم الساعة 6 مساءً",
    "0 0 * * 0": "كل يوم أحد عند منتصف الليل",
    "0 0 * * 1": "كل يوم إثنين عند منتصف الليل",
    "0 0 1 * *": "أول يوم من كل شهر",
    "*/30 * * * *": "كل 30 دقيقة",
    "*/15 * * * *": "كل 15 دقيقة",
    "*/5 * * * *": "كل 5 دقائق",
  };

  const description = descriptions[expression] || `مخصص: ${expression}`;

  return { valid: true, description };
}
