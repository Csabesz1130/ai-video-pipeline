import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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

// Zod schema based on VideoGenerationRequest type
const formSchema = z.object({
  topic: z.string().min(1, "Topic is required").min(3, "Topic must be at least 3 characters"),
  platforms: z
    .array(z.enum(["tiktok", "reels", "shorts"]))
    .min(1, "At least one platform must be selected"),
  style: z.string().optional(),
  targetAudience: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface VideoGenerationFormProps {
  onSubmit: (data: VideoGenerationRequest) => Promise<void>
  isSubmitting?: boolean
}

const platforms = [
  { id: "tiktok", label: "TikTok" },
  { id: "reels", label: "Instagram Reels" },
  { id: "shorts", label: "YouTube Shorts" },
] as const

export function VideoGenerationForm({ onSubmit, isSubmitting = false }: VideoGenerationFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      platforms: [],
      style: "",
      targetAudience: "",
    },
  })

  const handleSubmit = async (data: FormData) => {
    const videoRequest: VideoGenerationRequest = {
      topic: data.topic,
      platforms: data.platforms,
      style: data.style || undefined,
      targetAudience: data.targetAudience || undefined,
    }
    
    await onSubmit(videoRequest)
  }

  const isFormValid = form.formState.isValid
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Topic Field */}
          <FormField
            control={form.control}
            name="topic"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Topic *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your video topic (e.g., 'How to make coffee')"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Platforms Field */}
          <FormField
            control={form.control}
            name="platforms"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base font-medium">
                    Target Platforms *
                  </FormLabel>
                  <p className="text-sm text-gray-600 mt-1">
                    Select the platforms where you want to share your video
                  </p>
                </div>
                <div className="space-y-3">
                  {platforms.map((platform) => (
                    <FormField
                      key={platform.id}
                      control={form.control}
                      name="platforms"
                      render={({ field }: any) => {
                        return (
                          <FormItem
                            key={platform.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(platform.id)}
                                onChange={(checked: boolean) => {
                                  const updatedValue = checked
                                    ? [...(field.value || []), platform.id]
                                    : field.value?.filter(
                                        (value: string) => value !== platform.id
                                      ) || []
                                  field.onChange(updatedValue)
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="font-normal cursor-pointer">
                                {platform.label}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Style Field */}
          <FormField
            control={form.control}
            name="style"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Style</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter video style (e.g., 'Educational', 'Entertaining', 'Tutorial')"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target Audience Field */}
          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }: any) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your target audience (e.g., 'Young professionals interested in productivity tips')"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
      </Form>
    </div>
  )
}