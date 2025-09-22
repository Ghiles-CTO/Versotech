import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Shield,
  CreditCard,
  Upload,
  Calendar,
  ExternalLink
} from 'lucide-react'

const taskCategories = [
  {
    id: 'onboarding',
    name: 'Account Onboarding',
    description: 'Complete your investor profile setup',
    progress: 75,
    totalTasks: 4,
    completedTasks: 3
  },
  {
    id: 'compliance',
    name: 'Compliance & KYC',
    description: 'Required regulatory documentation',
    progress: 50,
    totalTasks: 6,
    completedTasks: 3
  },
  {
    id: 'investment',
    name: 'Investment Setup',
    description: 'Vehicle subscriptions and commitments',
    progress: 25,
    totalTasks: 4,
    completedTasks: 1
  }
]

const tasks = [
  {
    id: '1',
    title: 'Upload Government-Issued ID',
    description: 'Provide a clear photo of your passport or driver&apos;s license',
    category: 'compliance',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-10',
    completedAt: '2024-01-08',
    estimatedTime: '2 minutes'
  },
  {
    id: '2',
    title: 'Complete Investor Questionnaire',
    description: 'Answer questions about your investment experience and objectives',
    category: 'onboarding',
    status: 'completed',
    priority: 'medium',
    dueDate: '2024-01-15',
    completedAt: '2024-01-12',
    estimatedTime: '10 minutes'
  },
  {
    id: '3',
    title: 'Sign VERSO Holdings NDA',
    description: 'Review and electronically sign the confidentiality agreement',
    category: 'compliance',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-01-20',
    estimatedTime: '5 minutes'
  },
  {
    id: '4',
    title: 'Verify Banking Information',
    description: 'Confirm your bank account details for capital calls and distributions',
    category: 'investment',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-01-25',
    estimatedTime: '3 minutes'
  },
  {
    id: '5',
    title: 'Review VERSO FUND Subscription Agreement',
    description: 'Review terms and conditions for your investment commitment',
    category: 'investment',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2024-01-30',
    estimatedTime: '15 minutes'
  },
  {
    id: '6',
    title: 'Complete Anti-Money Laundering Screening',
    description: 'Automated background check for regulatory compliance',
    category: 'compliance',
    status: 'pending',
    priority: 'medium',
    dueDate: '2024-02-01',
    estimatedTime: '1 minute'
  }
]

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-600" />
    case 'pending':
      return <Clock className="h-4 w-4 text-gray-400" />
    case 'overdue':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-gray-100 text-gray-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'onboarding':
      return <FileText className="h-4 w-4" />
    case 'compliance':
      return <Shield className="h-4 w-4" />
    case 'investment':
      return <CreditCard className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

export default function TasksPage() {
  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in_progress')
  const completedTasks = tasks.filter(task => task.status === 'completed')

  return (
    <AppLayout brand="versoholdings">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks & Onboarding</h1>
          <p className="text-gray-600 mt-1">
            Complete your required tasks to activate full portal access
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {taskCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {getCategoryIcon(category.id)}
                  {category.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{category.completedTasks} of {category.totalTasks} completed</span>
                    <span>{category.progress}%</span>
                  </div>
                  <Progress value={category.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Tasks ({pendingTasks.length})</CardTitle>
              <CardDescription>
                Complete these tasks to proceed with your onboarding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority} priority
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.estimatedTime}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                      <Button size="sm">
                        {task.status === 'in_progress' ? 'Continue' : 'Start'}
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
              <CardDescription>
                Tasks you&apos;ve successfully completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-700">{task.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Recently'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-blue-900">Need Help?</div>
                <div className="text-sm text-blue-700">
                  If you have questions about any task or need assistance with documentation, 
                  our team is here to help.
                </div>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}