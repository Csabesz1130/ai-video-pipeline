import React, { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
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

export function VideoGenerationFormSimple({ onSubmit, isSubmitting = false }: VideoGenerationFormProps) {
  const [formData, setFormData] = useState({
    topic: "",
    platforms: [] as PlatformId[],
    style: "",
    targetAudience: "",
  })

  const [errors, setErrors] = useState({
    topic: "",
    platforms: "",
  })

  const validateForm = () => {
    const newErrors = { topic: "", platforms: "" }
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const videoRequest: VideoGenerationRequest = {
      topic: formData.topic,
      platforms: formData.platforms,
      style: formData.style || undefined,
      targetAudience: formData.targetAudience || undefined,
    }
    
    await onSubmit(videoRequest)
  }

  const handlePlatformChange = (platformId: PlatformId, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      platforms: checked
        ? [...prev.platforms, platformId]
        : prev.platforms.filter(p => p !== platformId)
    }))
    
    // Clear platform error when user selects a platform
    if (checked && errors.platforms) {
      setErrors(prev => ({ ...prev, platforms: "" }))
    }
  }

  const handleTopicChange = (value: string) => {
    setFormData(prev => ({ ...prev, topic: value }))
    
    // Clear topic error when user starts typing
    if (value.trim() && errors.topic) {
      setErrors(prev => ({ ...prev, topic: "" }))
    }
  }

  const isFormValid = formData.topic.trim().length >= 3 && formData.platforms.length > 0
  const isDisabled = !isFormValid || isSubmitting

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generate AI Video Content
        </h2>
        <p className="text-gray-600">
          Create engaging video content for your social media platforms
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-700">
            Topic *
          </label>
          <Input
            placeholder="Enter your video topic (e.g., 'How to make coffee')"
            value={formData.topic}
            onChange={(e) => handleTopicChange(e.target.value)}
          />
          {errors.topic && (
            <p className="text-sm font-medium text-red-500">{errors.topic}</p>
          )}
        </div>

        {/* Platforms Field */}
        <div className="space-y-2">
          <div className="mb-4">
            <label className="text-base font-medium text-gray-700">
              Target Platforms *
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Select the platforms where you want to share your video
            </p>
          </div>
          <div className="space-y-3">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="flex flex-row items-start space-x-3 space-y-0"
              >
                <Checkbox
                  checked={formData.platforms.includes(platform.id)}
                  onChange={(checked) => handlePlatformChange(platform.id, checked)}
                />
                <div className="space-y-1 leading-none">
                  <label className="font-normal cursor-pointer text-gray-700">
                    {platform.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
          {errors.platforms && (
            <p className="text-sm font-medium text-red-500">{errors.platforms}</p>
          )}
        </div>

        {/* Style Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-700">
            Style
          </label>
          <Input
            placeholder="Enter video style (e.g., 'Educational', 'Entertaining', 'Tutorial')"
            value={formData.style}
            onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
          />
        </div>

        {/* Target Audience Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-gray-700">
            Target Audience
          </label>
          <Textarea
            placeholder="Describe your target audience (e.g., 'Young professionals interested in productivity tips')"
            className="min-h-[100px]"
            value={formData.targetAudience}
            onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={isDisabled}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Video"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}