import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface HeatmapData {
  hour: number;
  day: number; // 0 = Sunday, 6 = Saturday
  tips: number;
  amount: number;
}

interface TipHeatmapProps {
  data: HeatmapData[];
}

export function TipHeatmap({ data }: TipHeatmapProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate max values for color scaling
  const maxTips = Math.max(...data.map(d => d.tips), 1);
  const maxAmount = Math.max(...data.map(d => d.amount), 1);

  // Get data for specific hour and day
  const getDataPoint = (hour: number, day: number) => {
    return data.find(d => d.hour === hour && d.day === day) || { hour, day, tips: 0, amount: 0 };
  };

  // Calculate intensity (0-1) based on tip count
  const getIntensity = (tips: number) => {
    return tips / maxTips;
  };

  // Get color based on intensity
  const getHeatmapColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity < 0.2) return 'bg-green-100 dark:bg-green-900/30';
    if (intensity < 0.4) return 'bg-green-200 dark:bg-green-800/50';
    if (intensity < 0.6) return 'bg-green-300 dark:bg-green-700/70';
    if (intensity < 0.8) return 'bg-green-400 dark:bg-green-600/80';
    return 'bg-green-500 dark:bg-green-500';
  };

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return '12A';
    if (hour < 12) return `${hour}A`;
    if (hour === 12) return '12P';
    return `${hour - 12}P`;
  };

  // Find peak time
  const peakData = data.reduce((max, current) => 
    current.tips > max.tips ? current : max, 
    { hour: 0, day: 0, tips: 0, amount: 0 }
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Tip Heatmap
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Peak activity hours throughout the week
          </p>
        </div>
        
        {peakData.tips > 0 && (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Peak: {days[peakData.day]} {formatHour(peakData.hour)}
          </Badge>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-2">
        {/* Hour labels */}
        <div className="grid grid-cols-25 gap-1 text-xs text-gray-500 dark:text-gray-400">
          <div></div> {/* Empty corner */}
          {hours.filter((_, i) => i % 3 === 0).map(hour => (
            <div key={hour} className="col-span-3 text-center">
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Heatmap rows */}
        {days.map((dayName, dayIndex) => (
          <div key={dayIndex} className="grid grid-cols-25 gap-1 items-center">
            {/* Day label */}
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 w-8">
              {dayName}
            </div>
            
            {/* Hour cells */}
            {hours.map(hour => {
              const dataPoint = getDataPoint(hour, dayIndex);
              const intensity = getIntensity(dataPoint.tips);
              const colorClass = getHeatmapColor(intensity);
              
              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  className={`aspect-square rounded-sm ${colorClass} cursor-pointer transition-all hover:scale-110 relative group`}
                  title={`${dayName} ${formatHour(hour)}: ${dataPoint.tips} tips, $${dataPoint.amount.toFixed(2)}`}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                    {dayName} {formatHour(hour)}<br />
                    {dataPoint.tips} tips<br />
                    ${dataPoint.amount.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
            <div className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/30"></div>
            <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800/50"></div>
            <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700/70"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600/80"></div>
            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500"></div>
          </div>
          <span>More</span>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Hover for details
        </div>
      </div>
    </Card>
  );
}