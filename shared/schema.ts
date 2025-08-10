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

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (for auth and billing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  plan: varchar("plan", { length: 20 }).notNull().default("free"), // 'free' | 'pro'
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }), // 'active' | 'cancelled' | 'past_due'
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profiles (tip pages) - one user can have multiple profiles
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  handle: varchar("handle", { length: 50 }).notNull().unique(),
  jobTitle: varchar("job_title", { length: 100 }),
  businessName: varchar("business_name", { length: 100 }),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  // Payment methods
  venmoHandle: varchar("venmo_handle", { length: 50 }),
  cashappHandle: varchar("cashapp_handle", { length: 50 }),
  zelleInfo: varchar("zelle_info", { length: 100 }),
  stripeAccountId: varchar("stripe_account_id", { length: 100 }),
  // Review links
  googleReviewUrl: text("google_review_url"),
  yelpReviewUrl: text("yelp_review_url"),
  // Customization
  theme: jsonb("theme"), // colors, fonts, custom branding
  qrCodeUrl: text("qr_code_url"),
  shortLinks: jsonb("short_links"), // NFC/QR short links
  // Settings
  isActive: boolean("is_active").default(true),
  enableWalletPass: boolean("enable_wallet_pass").default(false),
  teamSplitConfig: jsonb("team_split_config"), // for team split feature
  customDomain: varchar("custom_domain", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("profiles_user_id_idx").on(table.userId),
  handleIdx: index("profiles_handle_idx").on(table.handle),
}));

// Tips table
export const tips = pgTable("tips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }).notNull(), // 'stripe', 'venmo', 'cashapp', 'zelle'
  paymentIntentId: varchar("payment_intent_id", { length: 100 }),
  customerName: varchar("customer_name", { length: 100 }),
  note: text("note"),
  rating: integer("rating"), // 1-5 stars
  reviewText: text("review_text"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'completed', 'failed'
  deviceInfo: jsonb("device_info"), // browser, OS, etc for analytics
  referrer: text("referrer"),
  ipHash: varchar("ip_hash", { length: 64 }), // hashed for privacy
  sessionId: varchar("session_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
}, (table) => ({
  profileIdIdx: index("tips_profile_id_idx").on(table.profileId),
  createdAtIdx: index("tips_created_at_idx").on(table.createdAt),
  statusIdx: index("tips_status_idx").on(table.status),
}));

// Analytics table
export const analytics = pgTable("analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  totalTips: integer("total_tips").default(0),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default('0'),
  avgTipAmount: decimal("avg_tip_amount", { precision: 10, scale: 2 }).default('0'),
  topPaymentMethod: varchar("top_payment_method", { length: 20 }),
  qrScans: integer("qr_scans").default(0),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default('0'),
  repeatCustomers: integer("repeat_customers").default(0),
  deviceBreakdown: jsonb("device_breakdown"), // mobile/desktop stats
}, (table) => ({
  profileIdIdx: index("analytics_profile_id_idx").on(table.profileId),
  dateIdx: index("analytics_date_idx").on(table.date),
}));

// QR scans tracking
export const qrScans = pgTable("qr_scans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  ipHash: varchar("ip_hash", { length: 64 }), // hashed for privacy
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  convertedToTip: boolean("converted_to_tip").default(false),
  tipId: uuid("tip_id").references(() => tips.id),
  sessionId: varchar("session_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  profileIdIdx: index("qr_scans_profile_id_idx").on(table.profileId),
  createdAtIdx: index("qr_scans_created_at_idx").on(table.createdAt),
}));

// Event tracking for analytics
export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id", { length: 100 }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'page_view', 'payment_handoff', 'payment_return', 'review_submitted'
  eventData: jsonb("event_data"), // additional event context
  userAgent: text("user_agent"),
  ipHash: varchar("ip_hash", { length: 64 }),
  referrer: text("referrer"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  profileIdIdx: index("events_profile_id_idx").on(table.profileId),
  sessionIdIdx: index("events_session_id_idx").on(table.sessionId),
  eventTypeIdx: index("events_event_type_idx").on(table.eventType),
  createdAtIdx: index("events_created_at_idx").on(table.createdAt),
}));

// Ad impressions tracking
export const impressions = pgTable("impressions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }),
  slot: varchar("slot", { length: 50 }).notNull(), // 'return', 'dashboard_side'
  adId: varchar("ad_id", { length: 100 }),
  sessionId: varchar("session_id", { length: 100 }),
  clicked: boolean("clicked").default(false),
  ipHash: varchar("ip_hash", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  profileIdIdx: index("impressions_profile_id_idx").on(table.profileId),
  slotIdx: index("impressions_slot_idx").on(table.slot),
  createdAtIdx: index("impressions_created_at_idx").on(table.createdAt),
}));

// Purchases (for Pro subscriptions and add-ons)
export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sku: varchar("sku", { length: 50 }).notNull(), // 'pro_monthly', 'pro_yearly', 'nfc_kit', 'custom_domain'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdIdx: index("purchases_user_id_idx").on(table.userId),
  skuIdx: index("purchases_sku_idx").on(table.sku),
  createdAtIdx: index("purchases_created_at_idx").on(table.createdAt),
}));

// Wallet passes (for loyalty/return customers)
export const walletPasses = pgTable("wallet_passes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: uuid("profile_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  passId: varchar("pass_id", { length: 100 }).notNull(), // Apple/Google wallet pass ID
  customerIdentifier: varchar("customer_identifier", { length: 100 }), // email or phone hash
  passType: varchar("pass_type", { length: 20 }).default("loyalty"), // 'loyalty', 'coupon'
  isActive: boolean("is_active").default(true),
  timesUsed: integer("times_used").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  profileIdIdx: index("wallet_passes_profile_id_idx").on(table.profileId),
  passIdIdx: index("wallet_passes_pass_id_idx").on(table.passId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  profiles: many(profiles),
  purchases: many(purchases),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
  tips: many(tips),
  analytics: many(analytics),
  qrScans: many(qrScans),
  events: many(events),
  impressions: many(impressions),
  walletPasses: many(walletPasses),
}));

export const tipsRelations = relations(tips, ({ one }) => ({
  profile: one(profiles, {
    fields: [tips.profileId],
    references: [profiles.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  profile: one(profiles, {
    fields: [analytics.profileId],
    references: [profiles.id],
  }),
}));

export const qrScansRelations = relations(qrScans, ({ one }) => ({
  profile: one(profiles, {
    fields: [qrScans.profileId],
    references: [profiles.id],
  }),
  tip: one(tips, {
    fields: [qrScans.tipId],
    references: [tips.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  profile: one(profiles, {
    fields: [events.profileId],
    references: [profiles.id],
  }),
}));

export const impressionsRelations = relations(impressions, ({ one }) => ({
  profile: one(profiles, {
    fields: [impressions.profileId],
    references: [profiles.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
}));

export const walletPassesRelations = relations(walletPasses, ({ one }) => ({
  profile: one(profiles, {
    fields: [walletPasses.profileId],
    references: [profiles.id],
  }),
}));

// Zod schemas for type safety
export const insertUserSchema = createInsertSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  createdAt: true,
  processedAt: true,
}).extend({
  amount: z.union([z.number(), z.string().transform(val => parseFloat(val))]),
});
export const insertAnalyticsSchema = createInsertSchema(analytics);
export const insertQrScanSchema = createInsertSchema(qrScans);
export const insertEventSchema = createInsertSchema(events);
export const insertImpressionSchema = createInsertSchema(impressions);
export const insertPurchaseSchema = createInsertSchema(purchases);
export const insertWalletPassSchema = createInsertSchema(walletPasses);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type QrScan = typeof qrScans.$inferSelect;
export type InsertQrScan = z.infer<typeof insertQrScanSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Impression = typeof impressions.$inferSelect;
export type InsertImpression = z.infer<typeof insertImpressionSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type WalletPass = typeof walletPasses.$inferSelect;
export type InsertWalletPass = z.infer<typeof insertWalletPassSchema>;