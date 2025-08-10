import {
  users,
  profiles,
  tips,
  analytics,
  qrScans,
  events,
  impressions,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type Tip,
  type InsertTip,
  type Analytics,
  type InsertAnalytics,
  type QrScan,
  type InsertQrScan,
  type Event,
  type InsertEvent,
  type Impression,
  type InsertImpression,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lt, sql, count, sum, avg } from "drizzle-orm";
import { createHash } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  getProfile(id: string): Promise<(Profile & { user: User }) | undefined>;
  getProfileByHandle(handle: string): Promise<(Profile & { user: User }) | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined>;
  deleteProfile(id: string): Promise<boolean>;
  getUserProfiles(userId: string): Promise<Profile[]>;

  // Tip operations
  createTip(tip: InsertTip): Promise<Tip>;
  getTip(id: string): Promise<Tip | undefined>;
  updateTipStatus(id: string, status: string, processedAt?: Date): Promise<Tip | undefined>;
  getProfileTips(profileId: string, limit?: number): Promise<Tip[]>;

  // Analytics operations
  getProfileAnalytics(profileId: string, startDate: Date, endDate: Date): Promise<Analytics[]>;
  updateDailyAnalytics(profileId: string, date: Date): Promise<void>;

  // Event tracking
  trackEvent(event: InsertEvent): Promise<Event>;
  getProfileEvents(profileId: string, eventType?: string, limit?: number): Promise<Event[]>;

  // QR scan tracking
  trackQrScan(scan: InsertQrScan): Promise<QrScan>;
  updateQrScanConversion(scanId: string, tipId: string): Promise<QrScan | undefined>;

  // Ad impressions
  trackImpression(impression: InsertImpression): Promise<Impression>;
  updateImpressionClick(impressionId: string): Promise<Impression | undefined>;
  
  // Additional analytics methods
  getTipsByProfile(profileId: string, days?: number): Promise<Tip[]>;
  getQrScanCount(profileId: string, days?: number): Promise<number>;
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + process.env.IP_SALT || 'tipvault-salt').digest('hex');
}

export class DatabaseStorage implements IStorage {
  // User operations (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(id: string): Promise<(Profile & { user: User }) | undefined> {
    const result = await db
      .select()
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.id, id))
      .limit(1);
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].profiles,
      user: result[0].users,
    };
  }

  async getProfileByHandle(handle: string): Promise<(Profile & { user: User }) | undefined> {
    const result = await db
      .select()
      .from(profiles)
      .innerJoin(users, eq(profiles.userId, users.id))
      .where(eq(profiles.handle, handle))
      .limit(1);
    
    if (!result[0]) return undefined;
    
    return {
      ...result[0].profiles,
      user: result[0].users,
    };
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [createdProfile] = await db
      .insert(profiles)
      .values(profile)
      .returning();
    return createdProfile;
  }

  async updateProfile(id: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.id, id))
      .returning();
    return updatedProfile;
  }

  async deleteProfile(id: string): Promise<boolean> {
    const result = await db
      .delete(profiles)
      .where(eq(profiles.id, id));
    return result.rowCount! > 0;
  }

  async getUserProfiles(userId: string): Promise<Profile[]> {
    return db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .orderBy(desc(profiles.createdAt));
  }

  // Tip operations
  async createTip(tip: InsertTip): Promise<Tip> {
    const tipData = {
      ...tip,
      ipHash: tip.ipHash || hashIp('0.0.0.0'), // Default if not provided
    };

    const [createdTip] = await db
      .insert(tips)
      .values(tipData)
      .returning();
    return createdTip;
  }

  async getTip(id: string): Promise<Tip | undefined> {
    const [tip] = await db
      .select()
      .from(tips)
      .where(eq(tips.id, id))
      .limit(1);
    return tip;
  }

  async updateTipStatus(id: string, status: string, processedAt?: Date): Promise<Tip | undefined> {
    const updateData: any = { status };
    if (processedAt) {
      updateData.processedAt = processedAt;
    }

    const [updatedTip] = await db
      .update(tips)
      .set(updateData)
      .where(eq(tips.id, id))
      .returning();
    return updatedTip;
  }

  async getProfileTips(profileId: string, limit = 50): Promise<Tip[]> {
    return db
      .select()
      .from(tips)
      .where(eq(tips.profileId, profileId))
      .orderBy(desc(tips.createdAt))
      .limit(limit);
  }

  // Analytics operations
  async getProfileAnalytics(profileId: string, startDate: Date, endDate: Date): Promise<Analytics[]> {
    return db
      .select()
      .from(analytics)
      .where(
        and(
          eq(analytics.profileId, profileId),
          gte(analytics.date, startDate),
          lt(analytics.date, endDate)
        )
      )
      .orderBy(analytics.date);
  }

  async updateDailyAnalytics(profileId: string, date: Date): Promise<void> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get daily stats
    const [dailyStats] = await db
      .select({
        totalTips: count(tips.id),
        totalAmount: sum(tips.amount),
        avgTipAmount: avg(tips.amount),
      })
      .from(tips)
      .where(
        and(
          eq(tips.profileId, profileId),
          gte(tips.createdAt, startOfDay),
          lt(tips.createdAt, endOfDay),
          eq(tips.status, 'completed')
        )
      );

    // Get QR scan count
    const [scanStats] = await db
      .select({
        qrScans: count(qrScans.id),
      })
      .from(qrScans)
      .where(
        and(
          eq(qrScans.profileId, profileId),
          gte(qrScans.createdAt, startOfDay),
          lt(qrScans.createdAt, endOfDay)
        )
      );

    // Calculate conversion rate
    const conversionRate = scanStats.qrScans > 0 
      ? (Number(dailyStats.totalTips) / scanStats.qrScans) * 100 
      : 0;

    // Upsert daily analytics
    await db
      .insert(analytics)
      .values({
        profileId,
        date: startOfDay,
        totalTips: Number(dailyStats.totalTips) || 0,
        totalAmount: dailyStats.totalAmount?.toString() || '0',
        avgTipAmount: dailyStats.avgTipAmount?.toString() || '0',
        qrScans: scanStats.qrScans || 0,
        conversionRate: conversionRate.toFixed(2),
      })
      .onConflictDoUpdate({
        target: [analytics.profileId, analytics.date],
        set: {
          totalTips: Number(dailyStats.totalTips) || 0,
          totalAmount: dailyStats.totalAmount?.toString() || '0',
          avgTipAmount: dailyStats.avgTipAmount?.toString() || '0',
          qrScans: scanStats.qrScans || 0,
          conversionRate: conversionRate.toFixed(2),
        },
      });
  }

  // Event tracking
  async trackEvent(event: InsertEvent): Promise<Event> {
    const eventData = {
      ...event,
      ipHash: event.ipHash || hashIp('0.0.0.0'),
    };

    const [createdEvent] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return createdEvent;
  }

  async getProfileEvents(profileId: string, eventType?: string, limit = 100): Promise<Event[]> {
    const conditions = [eq(events.profileId!, profileId)];
    if (eventType) {
      conditions.push(eq(events.eventType, eventType));
    }

    return db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.createdAt))
      .limit(limit);
  }

  // QR scan tracking
  async trackQrScan(scan: InsertQrScan): Promise<QrScan> {
    const scanData = {
      ...scan,
      ipHash: scan.ipHash || hashIp('0.0.0.0'),
    };

    const [createdScan] = await db
      .insert(qrScans)
      .values(scanData)
      .returning();
    return createdScan;
  }

  async updateQrScanConversion(scanId: string, tipId: string): Promise<QrScan | undefined> {
    const [updatedScan] = await db
      .update(qrScans)
      .set({
        convertedToTip: true,
        tipId,
      })
      .where(eq(qrScans.id, scanId))
      .returning();
    return updatedScan;
  }

  // Ad impressions
  async trackImpression(impression: InsertImpression): Promise<Impression> {
    const impressionData = {
      ...impression,
      ipHash: impression.ipHash || hashIp('0.0.0.0'),
    };

    const [createdImpression] = await db
      .insert(impressions)
      .values(impressionData)
      .returning();
    return createdImpression;
  }

  async updateImpressionClick(impressionId: string): Promise<Impression | undefined> {
    const [updatedImpression] = await db
      .update(impressions)
      .set({ clicked: true })
      .where(eq(impressions.id, impressionId))
      .returning();
    return updatedImpression;
  }

  // Additional analytics methods implementation
  async getTipsByProfile(profileId: string, days: number = 30): Promise<Tip[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return db
      .select()
      .from(tips)
      .where(
        and(
          eq(tips.profileId, profileId),
          gte(tips.createdAt, startDate),
          eq(tips.status, 'completed')
        )
      )
      .orderBy(desc(tips.createdAt));
  }

  async getQrScanCount(profileId: string, days: number = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const [result] = await db
      .select({
        count: count(qrScans.id)
      })
      .from(qrScans)
      .where(
        and(
          eq(qrScans.profileId, profileId),
          gte(qrScans.createdAt, startDate)
        )
      );
    
    return Number(result.count) || 0;
  }
}

export const storage = new DatabaseStorage();