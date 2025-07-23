import React, { useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { VideoGenerationRequest } from "../../../lib/types/videoRequest"

interface VideoGenerationFormProps {
  onSubmit: (data: VideoGenerationRequest) => Promise<void>
  isSubmitting?: boolean
}

const platforms = [
  { id: "tiktok", label: "TikTok" },
  { id: "reels", label: "Instagram Reels" },
  { id: "shorts", label: "YouTube Shorts" },
] as const

type PlatformId = typeof platforms[number]["id"]

interface FormData {
  topic: string
  platforms: PlatformId[]
  style: string
  targetAudience: string
}

interface FormErrors {
  topic: string
  platforms: string
}

export function VideoGenerationFormSimple({ onSubmit, isSubmitting = false }: VideoGenerationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    topic: "",
    platforms: [],
    style: "",
    targetAudience: "",
  })

  const [errors, setErrors] = useState<FormErrors>({
    topic: "",
    platforms: "",
  })

  const [touched, setTouched] = useState({
    topic: false,
    platforms: false,
  })

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = { topic: "", platforms: "" }
    let isValid = true

    if (!formData.topic.trim()) {
      newErrors.topic = "Topic is required"
      isValid = false
    } else if (formData.topic.trim().length < 3) {
      newErrors.topic = "Topic must be at least 3 characters"
      isValid = false
    }

    if (formData.platforms.length === 0) {
      newErrors.platforms = "At least one platform must be selected"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }, [formData.topic, formData.platforms.length])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({ topic: true, platforms: true })
    
    if (!validateForm()) {
      return
    }

    const videoRequest: VideoGenerationRequest = {
      topic: formData.topic.trim(),
      platforms: formData.platforms,
      style: formData.style.trim() || undefined,
      targetAudience: formData.targetAudience.trim() || undefined,
    }
    
    try {
      await onSubmit(videoRequest)
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  const handlePlatformChange = useCallback((platformId: PlatformId, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      platforms: checked
        ? [...prev.platforms, platformId]
        : prev.platforms.filter(p => p !== platformId)
    }))
    
    // Mark platforms as touched and clear error when user selects a platform
    if (checked) {
      setTouched(prev => ({ ...prev, platforms: true }))
      if (errors.platforms) {
        setErrors(prev => ({ ...prev, platforms: "" }))
      }
    }
  }, [errors.platforms])

  const handleTopicChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, topic: value }))
    
    // Clear topic error when user starts typing
    if (value.trim() && errors.topic) {
      setErrors(prev => ({ ...prev, topic: "" }))
    }
  }, [errors.topic])

  const handleTopicBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, topic: true }))
    validateForm()
  }, [validateForm])

  const handlePlatformsSectionClick = useCallback(() => {
    setTouched(prev => ({ ...prev, platforms: true }))
  }, [])

  const isFormValid = formData.topic.trim().length >= 3 && formData.platforms.length > 0
  const isDisabled = !isFormValid || isSubmitting

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generate AI Video Content
        </h2>
        <p className="text-gray-600">
          Create engaging video content for your social media platforms
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Topic Field */}
        <div className="space-y-2">
          <label 
            htmlFor="topic-input"
            className="text-sm font-medium leading-none text-gray-700"
          >
            Topic *
          </label>
          <Input
            id="topic-input"
            placeholder="Enter your video topic (e.g., 'How to make coffee')"
            value={formData.topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            onBlur={handleTopicBlur}
            aria-invalid={touched.topic && !!errors.topic}
            aria-describedby={touched.topic && errors.topic ? "topic-error" : undefined}
            className={touched.topic && errors.topic ? "border-red-500 focus:ring-red-500" : ""}
          />
          {touched.topic && errors.topic && (
            <p id="topic-error" className="text-sm font-medium text-red-500" role="alert">
              {errors.topic}
            </p>
          )}
        </div>

        {/* Platforms Field */}
        <fieldset className="space-y-2">
          <legend className="text-base font-medium text-gray-700">
            Target Platforms *
          </legend>
          <p className="text-sm text-gray-600">
            Select the platforms where you want to share your video
          </p>
          <div 
            className="space-y-3 mt-3" 
            onClick={handlePlatformsSectionClick}
            role="group"
            aria-labelledby="platforms-legend"
            aria-invalid={touched.platforms && !!errors.platforms}
            aria-describedby={touched.platforms && errors.platforms ? "platforms-error" : undefined}
          >
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="flex flex-row items-center space-x-3"
              >
                <Checkbox
                  id={`platform-${platform.id}`}
                  checked={formData.platforms.includes(platform.id)}
                  onChange={(checked) => handlePlatformChange(platform.id, checked)}
                  aria-describedby={`platform-${platform.id}-label`}
                />
                <label 
                  id={`platform-${platform.id}-label`}
                  htmlFor={`platform-${platform.id}`}
                  className="text-sm font-normal cursor-pointer text-gray-700 select-none"
                >
                  {platform.label}
                </label>
              </div>
            ))}
          </div>
          {touched.platforms && errors.platforms && (
            <p id="platforms-error" className="text-sm font-medium text-red-500" role="alert">
              {errors.platforms}
            </p>
          )}
        </fieldset>

        {/* Style Field */}
        <div className="space-y-2">
          <label 
            htmlFor="style-input"
            className="text-sm font-medium leading-none text-gray-700"
          >
            Style
          </label>
          <Input
            id="style-input"
            placeholder="Enter video style (e.g., 'Educational', 'Entertaining', 'Tutorial')"
            value={formData.style}
            onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
          />
        </div>

        {/* Target Audience Field */}
        <div className="space-y-2">
          <label 
            htmlFor="audience-input"
            className="text-sm font-medium leading-none text-gray-700"
          >
            Target Audience
          </label>
          <Textarea
            id="audience-input"
            placeholder="Describe your target audience (e.g., 'Young professionals interested in productivity tips')"
            className="min-h-[100px] resize-vertical"
            value={formData.targetAudience}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button
            type="submit"
            disabled={isDisabled}
            className="min-w-[140px]"
            aria-describedby="submit-status"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Generating...</span>
              </>
            ) : (
              "Generate Video"
            )}
          </Button>
          <span id="submit-status" className="sr-only">
            {isSubmitting ? "Form is being submitted" : isDisabled ? "Form is invalid, please fill required fields" : "Form is ready to submit"}
          </span>
        </div>
      </form>
    </div>
  )
}