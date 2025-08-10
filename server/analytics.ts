// Analytics service for tip performance tracking
import { storage } from './storage';

export interface AnalyticsData {
  totalTips: number;
  totalAmount: number;
  averageTip: number;
  peakHours: { hour: number; tips: number; amount: number }[];
  dailyTrends: { date: string; tips: number; amount: number }[];
  conversionRate: number;
  qrScans: number;
}

export interface HeatmapData {
  hour: number;
  day: number; // 0 = Sunday, 6 = Saturday
  tips: number;
  amount: number;
}

export class AnalyticsService {
  
  async getTipAnalytics(profileId: string, days: number = 30): Promise<AnalyticsData> {
    try {
      const tips = await storage.getTipsByProfile(profileId, days);
      const qrScans = await storage.getQrScanCount(profileId, days);
      
      const totalTips = tips.length;
      const totalAmount = tips.reduce((sum, tip) => sum + Number(tip.amount), 0);
      const averageTip = totalTips > 0 ? totalAmount / totalTips : 0;
      
      // Calculate conversion rate (tips / QR scans)
      const conversionRate = qrScans > 0 ? (totalTips / qrScans) * 100 : 0;
      
      // Group by hour for peak analysis
      const hourlyData = this.groupTipsByHour(tips);
      const peakHours = hourlyData
        .sort((a, b) => b.tips - a.tips)
        .slice(0, 5);
      
      // Group by day for trends
      const dailyTrends = this.groupTipsByDay(tips, days);
      
      return {
        totalTips,
        totalAmount,
        averageTip,
        peakHours,
        dailyTrends,
        conversionRate,
        qrScans
      };
    } catch (error) {
      console.error('Analytics calculation error:', error);
      return this.getEmptyAnalytics();
    }
  }
  
  async getHeatmapData(profileId: string, days: number = 30): Promise<HeatmapData[]> {
    try {
      const tips = await storage.getTipsByProfile(profileId, days);
      const heatmapData: HeatmapData[] = [];
      
      // Initialize all hours and days with 0
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          heatmapData.push({ hour, day, tips: 0, amount: 0 });
        }
      }
      
      // Populate with actual tip data
      tips.forEach(tip => {
        const date = new Date(tip.createdAt);
        const hour = date.getHours();
        const day = date.getDay();
        
        const dataPoint = heatmapData.find(d => d.hour === hour && d.day === day);
        if (dataPoint) {
          dataPoint.tips += 1;
          dataPoint.amount += Number(tip.amount);
        }
      });
      
      return heatmapData;
    } catch (error) {
      console.error('Heatmap data error:', error);
      return this.getEmptyHeatmap();
    }
  }
  
  private groupTipsByHour(tips: any[]) {
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      tips: 0,
      amount: 0
    }));
    
    tips.forEach(tip => {
      const hour = new Date(tip.createdAt).getHours();
      hourlyData[hour].tips += 1;
      hourlyData[hour].amount += Number(tip.amount);
    });
    
    return hourlyData;
  }
  
  private groupTipsByDay(tips: any[], days: number) {
    const dailyData = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTips = tips.filter(tip => 
        tip.createdAt.startsWith(dateStr)
      );
      
      dailyData.push({
        date: dateStr,
        tips: dayTips.length,
        amount: dayTips.reduce((sum, tip) => sum + Number(tip.amount), 0)
      });
    }
    
    return dailyData;
  }
  
  private getEmptyAnalytics(): AnalyticsData {
    return {
      totalTips: 0,
      totalAmount: 0,
      averageTip: 0,
      peakHours: [],
      dailyTrends: [],
      conversionRate: 0,
      qrScans: 0
    };
  }
  
  private getEmptyHeatmap(): HeatmapData[] {
    const heatmapData: HeatmapData[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmapData.push({ hour, day, tips: 0, amount: 0 });
      }
    }
    return heatmapData;
  }
  
  // Generate realistic mock data for demo purposes
  generateMockAnalytics(profileId: string): AnalyticsData {
    const now = new Date();
    const mockTips = [];
    
    // Generate 30 days of mock tip data
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // More tips on weekends and during peak hours
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseCount = isWeekend ? 8 : 5;
      const tipCount = Math.floor(Math.random() * baseCount) + 1;
      
      for (let j = 0; j < tipCount; j++) {
        // Peak hours: 11am-2pm (lunch) and 6pm-9pm (dinner)
        const peakHours = [11, 12, 13, 18, 19, 20];
        const hour = Math.random() < 0.6 
          ? peakHours[Math.floor(Math.random() * peakHours.length)]
          : Math.floor(Math.random() * 24);
        
        const tipDate = new Date(date);
        tipDate.setHours(hour, Math.floor(Math.random() * 60));
        
        const amount = Math.random() < 0.3 
          ? Math.round((Math.random() * 20 + 5) * 100) / 100  // Larger tips
          : Math.round((Math.random() * 10 + 2) * 100) / 100; // Regular tips
        
        mockTips.push({
          createdAt: tipDate.toISOString(),
          amount: amount
        });
      }
    }
    
    return {
      totalTips: mockTips.length,
      totalAmount: mockTips.reduce((sum, tip) => sum + tip.amount, 0),
      averageTip: mockTips.length > 0 ? mockTips.reduce((sum, tip) => sum + tip.amount, 0) / mockTips.length : 0,
      peakHours: this.groupTipsByHour(mockTips).sort((a, b) => b.tips - a.tips).slice(0, 5),
      dailyTrends: this.groupTipsByDay(mockTips, 30),
      conversionRate: 24.5, // Mock conversion rate
      qrScans: Math.floor(mockTips.length / 0.245) // Mock QR scans based on conversion
    };
  }
}

export const analyticsService = new AnalyticsService();