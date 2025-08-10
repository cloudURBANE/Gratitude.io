import {
  type User,
  type Profile,
  type Tip,
  type QrScan,
  type InsertUser,
  type InsertProfile,
  type InsertTip,
  type InsertQrScan
} from "@shared/schema";

// In-memory storage interface (fallback when database is unavailable)
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  getProfileByHandle(handle: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;
  
  // Tip operations
  createTip(tip: InsertTip): Promise<Tip>;
  getTipsByProfile(profileId: string): Promise<Tip[]>;
  getTipStats(profileId: string): Promise<{
    totalEarnings: number;
    totalTips: number;
    averageTip: number;
    thisWeekEarnings: number;
  }>;
  
  // QR scan operations
  createQrScan(scan: InsertQrScan): Promise<QrScan>;
  getQrScansByProfile(profileId: string): Promise<QrScan[]>;
  getQrScanStats(profileId: string): Promise<{
    totalScans: number;
    uniqueVisitors: number;
    conversionRate: number;
  }>;
}

// Memory storage implementation (for development/demo)
export class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private profiles = new Map<string, Profile>();
  private tips = new Map<string, Tip>();
  private qrScans = new Map<string, QrScan>();

  private generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = {
      id: this.generateId(),
      email: userData.email,
      passwordHash: userData.passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    for (const profile of this.profiles.values()) {
      if (profile.userId === userId) {
        return profile;
      }
    }
    return undefined;
  }

  async getProfileByHandle(handle: string): Promise<Profile | undefined> {
    for (const profile of this.profiles.values()) {
      if (profile.handle === handle) {
        return profile;
      }
    }
    return undefined;
  }

  async createProfile(profileData: InsertProfile): Promise<Profile> {
    const profile: Profile = {
      id: this.generateId(),
      userId: profileData.userId,
      handle: profileData.handle,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      bio: profileData.bio || null,
      workplace: profileData.workplace || null,
      jobTitle: profileData.jobTitle || null,
      venmoHandle: profileData.venmoHandle || null,
      cashappHandle: profileData.cashappHandle || null,
      zelleEmail: profileData.zelleEmail || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.profiles.set(profile.id, profile);
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error('Profile not found');
    
    const updatedProfile = { ...profile, ...updates, updatedAt: new Date() };
    this.profiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  // Tip operations
  async createTip(tipData: InsertTip): Promise<Tip> {
    const tip: Tip = {
      id: this.generateId(),
      profileId: tipData.profileId,
      amount: tipData.amount,
      message: tipData.message || null,
      paymentMethod: tipData.paymentMethod,
      paymentIntentId: tipData.paymentIntentId || null,
      status: tipData.status,
      customerName: tipData.customerName || null,
      customerEmail: tipData.customerEmail || null,
      createdAt: new Date(),
    };
    this.tips.set(tip.id, tip);
    return tip;
  }

  async getTipsByProfile(profileId: string): Promise<Tip[]> {
    const tips = Array.from(this.tips.values()).filter(tip => tip.profileId === profileId);
    return tips.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTipStats(profileId: string): Promise<{
    totalEarnings: number;
    totalTips: number;
    averageTip: number;
    thisWeekEarnings: number;
  }> {
    const tips = await this.getTipsByProfile(profileId);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const totalEarnings = tips.reduce((sum, tip) => sum + tip.amount, 0);
    const totalTips = tips.length;
    const averageTip = totalTips > 0 ? totalEarnings / totalTips : 0;
    
    const thisWeekTips = tips.filter(tip => tip.createdAt >= oneWeekAgo);
    const thisWeekEarnings = thisWeekTips.reduce((sum, tip) => sum + tip.amount, 0);

    return {
      totalEarnings,
      totalTips,
      averageTip,
      thisWeekEarnings,
    };
  }

  // QR scan operations
  async createQrScan(scanData: InsertQrScan): Promise<QrScan> {
    const scan: QrScan = {
      id: this.generateId(),
      profileId: scanData.profileId,
      ipHash: scanData.ipHash,
      userAgent: scanData.userAgent || null,
      scannedAt: new Date(),
    };
    this.qrScans.set(scan.id, scan);
    return scan;
  }

  async getQrScansByProfile(profileId: string): Promise<QrScan[]> {
    const scans = Array.from(this.qrScans.values()).filter(scan => scan.profileId === profileId);
    return scans.sort((a, b) => b.scannedAt.getTime() - a.scannedAt.getTime());
  }

  async getQrScanStats(profileId: string): Promise<{
    totalScans: number;
    uniqueVisitors: number;
    conversionRate: number;
  }> {
    const scans = await this.getQrScansByProfile(profileId);
    const tips = await this.getTipsByProfile(profileId);
    
    const totalScans = scans.length;
    const uniqueIps = new Set(scans.map(scan => scan.ipHash));
    const uniqueVisitors = uniqueIps.size;
    const conversionRate = totalScans > 0 ? (tips.length / totalScans) * 100 : 0;

    return {
      totalScans,
      uniqueVisitors,
      conversionRate,
    };
  }
}

export const storage = new MemoryStorage();