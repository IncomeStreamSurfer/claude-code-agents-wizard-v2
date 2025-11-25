import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, DollarSign, MousePointerClick, Eye, Users } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track performance and gain insights from your campaigns
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Total Spend', value: '$0.00', icon: DollarSign, change: '+0%' },
          { title: 'Impressions', value: '0', icon: Eye, change: '+0%' },
          { title: 'Clicks', value: '0', icon: MousePointerClick, change: '+0%' },
          { title: 'Conversions', value: '0', icon: TrendingUp, change: '+0%' },
          { title: 'CTR', value: '0%', icon: BarChart3, change: '+0%' },
          { title: 'Reach', value: '0', icon: Users, change: '+0%' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change} from last period</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Campaign performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Chart placeholder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Breakdown</CardTitle>
            <CardDescription>Performance by advertising platform</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Chart placeholder</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest campaign performance updates</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No analytics data yet</p>
            <p className="text-sm text-muted-foreground">
              Connect campaigns to start tracking performance
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
