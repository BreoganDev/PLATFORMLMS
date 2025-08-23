
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { PlayCircle, Lock, ChevronDown, Clock } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface CourseContentProps {
  course: any
  isEnrolled: boolean
}

export function CourseContent({ course, isEnrolled }: CourseContentProps) {
  const totalLessons = course?.modules?.reduce((acc: number, module: any) => {
    return acc + (module?.lessons?.length || 0)
  }, 0) || 0

  const totalDuration = course?.modules?.reduce((acc: number, module: any) => {
    return acc + (module?.lessons?.reduce((lessonAcc: number, lesson: any) => {
      return lessonAcc + (lesson?.durationSeconds || 0)
    }, 0) || 0)
  }, 0) || 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Contenido del Curso</h2>
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
          <span>{course?.modules?.length || 0} módulos</span>
          <span>{totalLessons} lecciones</span>
          {totalDuration > 0 && <span>{formatDuration(totalDuration)} total</span>}
        </div>
      </div>

      <div className="space-y-4">
        {course?.modules?.map((module: any, moduleIndex: number) => {
          const moduleDuration = module?.lessons?.reduce((acc: number, lesson: any) => {
            return acc + (lesson?.durationSeconds || 0)
          }, 0) || 0

          return (
            <Card key={module?.id} className="overflow-hidden">
              <Collapsible defaultOpen={moduleIndex === 0}>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <CardTitle className="text-lg">
                          {moduleIndex + 1}. {module?.title}
                        </CardTitle>
                        <CardDescription>
                          {module?.lessons?.length || 0} lecciones
                          {moduleDuration > 0 && ` • ${formatDuration(moduleDuration)}`}
                        </CardDescription>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {module?.lessons?.map((lesson: any, lessonIndex: number) => {
                        const isAccessible = isEnrolled || lesson?.isFreePreview

                        return (
                          <div
                            key={lesson?.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              isAccessible
                                ? 'hover:bg-muted/50 cursor-pointer'
                                : 'bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                                {isAccessible ? (
                                  <PlayCircle className="h-4 w-4 text-primary" />
                                ) : (
                                  <Lock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {lessonIndex + 1}. {lesson?.title}
                                  </span>
                                  {lesson?.isFreePreview && (
                                    <Badge variant="outline" className="text-xs">
                                      Vista Previa
                                    </Badge>
                                  )}
                                </div>
                                {lesson?.durationSeconds > 0 && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(lesson?.durationSeconds)}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {!isAccessible && (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
