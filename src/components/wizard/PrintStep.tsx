'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Printer, Eye, Check } from 'lucide-react'
import { Petition } from '@/lib/types'

interface PrintStepProps {
  petition: Petition
  wizardData: {
    language: string
    contextId: string
    contextData: Record<string, unknown>
    generatedContent: string
  }
  onComplete: () => void
  onPrevious: () => void
}

export default function PrintStep({ 
  petition, 
  wizardData, 
  onComplete,
  onPrevious 
}: PrintStepProps) {
  
  const handlePrint = () => {
    window.open(`/petitions-print?id=${petition.id}`, '_blank')
  }

  const handleViewPetition = () => {
    window.open(`/petitions/${petition.id}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Check className="h-6 w-6" />
            Petitions Complete!
          </CardTitle>
          <p className="text-muted-foreground">
            Your petitions have been successfully created and are ready for use.
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">
              {petition.title}
            </h3>
            <div className="flex gap-4 text-sm text-green-700">
              <span>Date: {new Date(petition.date).toLocaleDateString()}</span>
              <span>Language: {wizardData.language}</span>
              <span>Context: {(wizardData.contextData?.name as string) || 'Unknown'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Options */}
      <Card>
        <CardHeader>
          <CardTitle>Print & Export Options</CardTitle>
          <p className="text-muted-foreground">
            Choose how you&apos;d like to use your petitions.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Button 
              onClick={handlePrint}
              className="flex items-center justify-between p-4 h-auto"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <Printer className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Print Petitions</div>
                  <div className="text-sm text-muted-foreground">
                    Open print-friendly view for liturgical use
                  </div>
                </div>
              </div>
            </Button>

            <Button 
              onClick={handleViewPetition}
              className="flex items-center justify-between p-4 h-auto"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">View Petition Details</div>
                  <div className="text-sm text-muted-foreground">
                    See full petition with context and options
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Title:</span>
              <span className="font-medium">{petition.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(petition.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Language:</span>
              <Badge variant="outline">{wizardData.language}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Context:</span>
              <span>{(wizardData.contextData?.name as string) || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Content Length:</span>
              <span>{wizardData.generatedContent?.length || 0} characters</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onComplete}>
          Complete & View Petition
        </Button>
      </div>
    </div>
  )
}