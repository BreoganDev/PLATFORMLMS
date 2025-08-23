
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Trophy, Clock } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface UserStatsProps {
  stats: {
    totalCourses: number
    completedCourses: number
    totalHours: number
  }
}

export function UserStats({ stats }: UserStatsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalCourses}</div>
          <CardDescription>
            {stats?.totalCourses === 1 ? 'curso activo' : 'cursos activos'}
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.completedCourses}</div>
          <CardDescription>
            {stats?.completedCourses === 1 ? 'curso terminado' : 'cursos terminados'}
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tiempo de Contenido</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.floor((stats?.totalHours || 0) / 3600)}h
          </div>
          <CardDescription>
            {formatDuration(stats?.totalHours || 0)} de contenido
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
