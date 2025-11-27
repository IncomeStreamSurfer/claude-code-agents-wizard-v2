import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Megaphone, Play, Pause, CheckCircle } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and optimize your advertising campaigns
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: 'Active', count: 0, icon: Play, color: 'text-green-500' },
          { title: 'Paused', count: 0, icon: Pause, color: 'text-yellow-500' },
          { title: 'Completed', count: 0, icon: CheckCircle, color: 'text-blue-500' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>View and manage all your advertising campaigns</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No campaigns yet</p>
          <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
            Create your first campaign to start advertising across multiple platforms
          </p>
          <Button>
            <Plus className="h-4 w-4" />
            Create Your First Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
