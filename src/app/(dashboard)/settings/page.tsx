import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Building2, Plug, CreditCard, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and platform preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: 'Profile',
            icon: User,
            desc: 'Update your personal information and preferences',
          },
          {
            title: 'Organization',
            icon: Building2,
            desc: 'Manage your organization and team members',
          },
          {
            title: 'Integrations',
            icon: Plug,
            desc: 'Connect advertising platforms and tools',
          },
          {
            title: 'Billing',
            icon: CreditCard,
            desc: 'Manage subscription and payment methods',
          },
          {
            title: 'Notifications',
            icon: Bell,
            desc: 'Configure email and push notifications',
          },
          {
            title: 'Security',
            icon: Shield,
            desc: 'Password, 2FA, and security settings',
          },
        ].map((item) => (
          <Card key={item.title} className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="text-sm">{item.desc}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Settings</CardTitle>
          <CardDescription>Commonly accessed settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">Settings panels coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}
