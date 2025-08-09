import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Workers table
export const workers = pgTable("workers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }),
  handle: varchar("handle", { length: 50 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  venmoHandle: varchar("venmo_handle", { length: 50 }),
  cashappHandle: varchar("cashapp_handle", { length: 50 }),
  zelleInfo: varchar("zelle_info", { length: 100 }),
  stripeAccountId: varchar("stripe_account_id", { length: 100 }),
  googleReviewUrl: text("google_review_url"),
  yelpReviewUrl: text("yelp_review_url"),
  qrCodeUrl: text("qr_code_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tips table
export const tips = pgTable("tips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: uuid("worker_id").notNull().references(() => workers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // 'stripe', 'venmo', 'cashapp', 'zelle'
  paymentIntentId: varchar("payment_intent_id", { length: 100 }),
  customerName: varchar("customer_name", { length: 100 }),
  note: text("note"),
  status: varchar("status", { length: 20 }).default('pending'), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: uuid("worker_id").notNull().references(() => workers.id),
  date: timestamp("date").notNull(),
  totalTips: integer("total_tips").default(0),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default('0'),
  avgTipAmount: decimal("avg_tip_amount", { precision: 10, scale: 2 }).default('0'),
  topPaymentMethod: varchar("top_payment_method", { length: 20 }),
  qrScans: integer("qr_scans").default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default('0'),
});

// QR scans tracking
export const qrScans = pgTable("qr_scans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  workerId: uuid("worker_id").notNull().references(() => workers.id),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  convertedToTip: boolean("converted_to_tip").default(false),
  tipId: uuid("tip_id").references(() => tips.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const workersRelations = relations(workers, ({ many }) => ({
  tips: many(tips),
  analytics: many(analytics),
  qrScans: many(qrScans),
}));

export const tipsRelations = relations(tips, ({ one }) => ({
  worker: one(workers, {
    fields: [tips.workerId],
    references: [workers.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  worker: one(workers, {
    fields: [analytics.workerId],
    references: [workers.id],
  }),
}));

export const qrScansRelations = relations(qrScans, ({ one }) => ({
  worker: one(workers, {
    fields: [qrScans.workerId],
    references: [workers.id],
  }),
  tip: one(tips, {
    fields: [qrScans.tipId],
    references: [tips.id],
  }),
}));

// Zod schemas
export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const insertQrScanSchema = createInsertSchema(qrScans).omit({
  id: true,
  createdAt: true,
});

// Types
export type Worker = typeof workers.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type QrScan = typeof qrScans.$inferSelect;
export type InsertQrScan = z.infer<typeof insertQrScanSchema>;
