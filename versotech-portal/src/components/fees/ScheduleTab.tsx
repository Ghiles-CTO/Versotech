/**
 * Schedule Tab - Calendar view of upcoming recurring fees
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/fees/calculations';
import { Calendar, DollarSign, Clock, TrendingUp } from 'lucide-react';

interface UpcomingFee {
  id: string;
  subscription_id: string;
  subscription_number: string;
  investor: {
    id: string;
    legal_name: string;
    display_name: string;
  };
  vehicle: {
    id: string;
    name: string;
  };
  fee_type: string;
  fee_name: string;
  amount: number;
  frequency: string;
  next_due_date: string;
  status: string;
}

interface ScheduleData {
  data: UpcomingFee[];
  summary: {
    total_scheduled: number;
    total_amount: number;
    date_range: {
      from: string;
      to: string;
    };
  };
  by_month: Record<string, {
    fees: UpcomingFee[];
    total: number;
  }>;
}

export default function ScheduleTab() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysAhead, setDaysAhead] = useState(60);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/fees/schedules?days=${daysAhead}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => {
    fetchSchedules();
  }, [daysAhead, fetchSchedules]);

  if (loading) {
    return <div className="text-white">Loading fee schedules...</div>;
  }

  if (!data) {
    return <div className="text-white">Failed to load fee schedules</div>;
  }

  const feeTypeColors: Record<string, string> = {
    management: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    subscription: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    performance: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Fee Schedule</h2>
        <p className="text-gray-400">Upcoming recurring fees for the next {daysAhead} days</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {data.summary.total_scheduled}
            </div>
            <p className="text-xs text-gray-400">
              Recurring fees due
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(data.summary.total_amount)}
            </div>
            <p className="text-xs text-gray-400">
              Total amount scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date Range</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-white">
              {new Date(data.summary.date_range.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' - '}
              {new Date(data.summary.date_range.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <p className="text-xs text-gray-400">
              Forecast period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {[30, 60, 90, 180].map((days) => (
          <Button
            key={days}
            variant={daysAhead === days ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDaysAhead(days)}
          >
            {days} days
          </Button>
        ))}
      </div>

      {/* Grouped by Month */}
      {Object.keys(data.by_month).length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-400">No upcoming fees scheduled for the next {daysAhead} days</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(data.by_month).map(([month, monthData]) => (
            <div key={month}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{month}</h3>
                <div className="text-sm text-gray-400">
                  {monthData.fees.length} fee{monthData.fees.length !== 1 ? 's' : ''} • {formatCurrency(monthData.total)}
                </div>
              </div>

              <div className="space-y-3">
                {monthData.fees.map((fee) => (
                  <Card key={fee.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={feeTypeColors[fee.fee_type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                              {fee.fee_name}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {fee.frequency}
                            </Badge>
                          </div>

                          <div className="space-y-1">
                            <p className="font-medium text-white">
                              {fee.investor.legal_name || fee.investor.display_name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {fee.vehicle.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              Subscription: {fee.subscription_number}
                            </p>
                            <p className="text-xs text-gray-500">
                              Due: {new Date(fee.next_due_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-white">
                            {formatCurrency(fee.amount)}
                          </div>
                          <Badge variant="secondary" className="mt-2">
                            {fee.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
