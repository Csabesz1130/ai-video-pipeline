import React, { useState } from "react"
import { VideoGenerationFormSimple } from "./VideoGenerationFormSimple"
import { VideoGenerationRequest } from "../../../lib/types/videoRequest"

export function VideoGenerationFormExample() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedData, setSubmittedData] = useState<VideoGenerationRequest | null>(null)

  const handleSubmit = async (data: VideoGenerationRequest) => {
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Form submitted with data:", data)
      setSubmittedData(data)
      
      // Here you would typically make an API call to generate the video
      // const response = await fetch('/api/generate-video', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // })
      
    } catch (error) {
      console.error("Error generating video:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <VideoGenerationFormSimple 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
      />
      
      {submittedData && (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Video Generation Request Submitted!
          </h3>
          <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-x-auto">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}