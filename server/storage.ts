import {
  workers,
  tips,
  analytics,
  qrScans,
  type Worker,
  type InsertWorker,
  type Tip,
  type InsertTip,
  type Analytics,
  type InsertAnalytics,
  type QrScan,
  type InsertQrScan,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql, sum, avg, count } from "drizzle-orm";

export interface IStorage {
  // Workers
  getWorker(id: string): Promise<Worker | undefined>;
  getWorkerByHandle(handle: string): Promise<Worker | undefined>;
  createWorker(worker: InsertWorker): Promise<Worker>;
  updateWorker(id: string, worker: Partial<InsertWorker>): Promise<Worker>;
  
  // Tips
  createTip(tip: InsertTip): Promise<Tip>;
  getTip(id: string): Promise<Tip | undefined>;
  updateTipStatus(id: string, status: string, paymentIntentId?: string): Promise<Tip>;
  getWorkerTips(workerId: string, limit?: number): Promise<Tip[]>;
  getWorkerDailyStats(workerId: string, date?: Date): Promise<{
    totalTips: number;
    totalAmount: string;
    avgAmount: string;
  }>;
  
  // Analytics
  updateDailyAnalytics(workerId: string, date: Date): Promise<void>;
  getWorkerAnalytics(workerId: string, days?: number): Promise<Analytics[]>;
  
  // QR Scans
  recordQrScan(scan: InsertQrScan): Promise<QrScan>;
  markQrScanConverted(scanId: string, tipId: string): Promise<void>;
  
  // Payment verification
  createPaymentIntent(paymentIntent: any): Promise<any>;
  getPaymentIntent(paymentId: string): Promise<any>;
  updatePaymentStatus(paymentId: string, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Workers
  async getWorker(id: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.id, id));
    return worker;
  }

  async getWorkerByHandle(handle: string): Promise<Worker | undefined> {
    const [worker] = await db.select().from(workers).where(eq(workers.handle, handle));
    return worker;
  }

  async createWorker(insertWorker: InsertWorker): Promise<Worker> {
    const [worker] = await db
      .insert(workers)
      .values(insertWorker)
      .returning();
    return worker;
  }

  async updateWorker(id: string, updateData: Partial<InsertWorker>): Promise<Worker> {
    const [worker] = await db
      .update(workers)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(workers.id, id))
      .returning();
    return worker;
  }

  // Tips
  async createTip(insertTip: InsertTip): Promise<Tip> {
    const [tip] = await db
      .insert(tips)
      .values(insertTip)
      .returning();
    return tip;
  }

  async getTip(id: string): Promise<Tip | undefined> {
    const [tip] = await db.select().from(tips).where(eq(tips.id, id));
    return tip;
  }

  async updateTipStatus(id: string, status: string, paymentIntentId?: string): Promise<Tip> {
    const updateData: any = { status };
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }
    
    const [tip] = await db
      .update(tips)
      .set(updateData)
      .where(eq(tips.id, id))
      .returning();
    return tip;
  }

  async getWorkerTips(workerId: string, limit = 50): Promise<Tip[]> {
    return await db
      .select()
      .from(tips)
      .where(eq(tips.workerId, workerId))
      .orderBy(desc(tips.createdAt))
      .limit(limit);
  }

  async getWorkerDailyStats(workerId: string, date = new Date()): Promise<{
    totalTips: number;
    totalAmount: string;
    avgAmount: string;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db
      .select({
        totalTips: count(tips.id),
        totalAmount: sql<string>`COALESCE(SUM(${tips.amount}), 0)`,
        avgAmount: sql<string>`COALESCE(AVG(${tips.amount}), 0)`,
      })
      .from(tips)
      .where(
        and(
          eq(tips.workerId, workerId),
          eq(tips.status, 'completed'),
          gte(tips.createdAt, startOfDay),
          sql`${tips.createdAt} <= ${endOfDay}`
        )
      );

    const [stats] = result;
    return {
      totalTips: stats?.totalTips || 0,
      totalAmount: stats?.totalAmount || '0',
      avgAmount: stats?.avgAmount || '0',
    };
  }

  // Analytics
  async updateDailyAnalytics(workerId: string, date: Date): Promise<void> {
    const stats = await this.getWorkerDailyStats(workerId, date);
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Get QR scan count for the day
    const [qrScanStats] = await db
      .select({
        scans: count(qrScans.id),
        conversions: count(sql`CASE WHEN ${qrScans.convertedToTip} = true THEN 1 END`),
      })
      .from(qrScans)
      .where(
        and(
          eq(qrScans.workerId, workerId),
          gte(qrScans.createdAt, startOfDay)
        )
      );

    const conversionRate = qrScanStats.scans > 0 
      ? (qrScanStats.conversions / qrScanStats.scans) * 100 
      : 0;

    // Upsert analytics record
    await db
      .insert(analytics)
      .values({
        workerId,
        date: startOfDay,
        totalTips: stats.totalTips,
        totalAmount: stats.totalAmount,
        avgTipAmount: stats.avgAmount,
        qrScans: qrScanStats.scans || 0,
        conversionRate: conversionRate.toString(),
      })
      .onConflictDoUpdate({
        target: [analytics.workerId, analytics.date],
        set: {
          totalTips: stats.totalTips,
          totalAmount: stats.totalAmount,
          avgTipAmount: stats.avgAmount,
          qrScans: qrScanStats.scans || 0,
          conversionRate: conversionRate.toString(),
        },
      });
  }

  async getWorkerAnalytics(workerId: string, days = 30): Promise<Analytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.workerId, workerId),
          gte(analytics.date, startDate)
        )
      )
      .orderBy(desc(analytics.date));
  }

  // QR Scans
  async recordQrScan(insertScan: InsertQrScan): Promise<QrScan> {
    const [scan] = await db
      .insert(qrScans)
      .values(insertScan)
      .returning();
    return scan;
  }

  async markQrScanConverted(scanId: string, tipId: string): Promise<void> {
    await db
      .update(qrScans)
      .set({
        convertedToTip: true,
        tipId,
      })
      .where(eq(qrScans.id, scanId));
  }
}

// Add payment verification methods to DatabaseStorage
class EnhancedDatabaseStorage extends DatabaseStorage {
  // In-memory storage for payment verification (demo purposes)
  private paymentIntents = new Map<string, any>();
  
  async createPaymentIntent(paymentIntent: any): Promise<any> {
    const intent = {
      ...paymentIntent,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.paymentIntents.set(paymentIntent.paymentId, intent);
    return intent;
  }

  async getPaymentIntent(paymentId: string): Promise<any> {
    return this.paymentIntents.get(paymentId) || null;
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    const intent = this.paymentIntents.get(paymentId);
    if (intent) {
      intent.status = status;
      intent.updatedAt = new Date();
      this.paymentIntents.set(paymentId, intent);
    }
  }
}

export const storage = new EnhancedDatabaseStorage();
