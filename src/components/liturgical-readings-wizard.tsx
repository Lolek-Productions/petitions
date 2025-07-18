'use client'

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface WizardStep {
  id: number
  title: string
  description: string
}

interface WizardNavigationProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  canProceed: boolean
  canGoBack: boolean
  onNext: () => void
  onPrevious: () => void
  nextLabel?: string
  previousLabel?: string
}

export function WizardNavigation({
  steps,
  currentStep,
  onStepChange,
  canProceed,
  canGoBack,
  onNext,
  onPrevious,
  nextLabel = "Next",
  previousLabel = "Previous"
}: WizardNavigationProps) {
  const progress = ((currentStep) / (steps.length - 1)) * 100

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Step {currentStep + 1} of {steps.length}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {steps[currentStep]?.title}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </div>
          </div>
          
          <Progress value={progress} className="w-full" />
          
          <div className="flex flex-wrap gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => onStepChange(index)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index < currentStep
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                disabled={index > currentStep}
              >
                {index + 1}. {step.title}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {previousLabel}
          </Button>
          
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export interface WizardContainerProps {
  children: React.ReactNode
  navigation: React.ReactNode
}

export function WizardContainer({ children, navigation }: WizardContainerProps) {
  return (
    <div className="space-y-6">
      {navigation}
      <div className="min-h-[400px]">
        {children}
      </div>
    </div>
  )
}