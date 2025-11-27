import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, DollarSign, Eye, Target, Plus } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { name: 'Active Campaigns', value: '0', icon: Target, change: 'No campaigns yet' },
    { name: 'Total Spend', value: '$0.00', icon: DollarSign, change: 'This month' },
    { name: 'Impressions', value: '0', icon: Eye, change: 'This month' },
    { name: 'Conversions', value: '0', icon: BarChart3, change: 'This month' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to AdForge</h1>
        <p className="text-muted-foreground mt-1">
          Your AI-powered digital marketing command center
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Start building your marketing campaigns with these quick actions
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Plus className="h-5 w-5" />
            <span>Create Campaign</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Target className="h-5 w-5" />
            <span>Research Market</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <BarChart3 className="h-5 w-5" />
            <span>Generate Creative</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
