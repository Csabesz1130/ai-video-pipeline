# VideoGenerationForm Component

A comprehensive React form component built with shadcn/ui, react-hook-form, and Zod validation for generating AI video content requests.

## Features

- **Form State Management**: Uses react-hook-form for efficient form state management
- **Validation**: Zod schema validation with real-time error messages
- **UI Components**: Built with shadcn/ui components for consistent styling
- **Loading States**: Submit button shows loading spinner during form submission
- **Responsive Design**: Fully responsive with Tailwind CSS
- **Type Safety**: Full TypeScript support based on VideoGenerationRequest type

## Form Fields

### Required Fields
- **Topic** (Input): The main topic/subject for the video content
- **Platforms** (Checkbox Group): Target platforms (TikTok, Instagram Reels, YouTube Shorts)

### Optional Fields
- **Style** (Input): Video style preference (e.g., "Educational", "Entertaining")
- **Target Audience** (Textarea): Description of the intended audience

## Usage

```tsx
import { VideoGenerationForm } from '@/components/VideoGenerationForm'
import { VideoGenerationRequest } from '@/lib/types/videoRequest'

function MyComponent() {
  const handleSubmit = async (data: VideoGenerationRequest) => {
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      // Handle response
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <VideoGenerationForm 
      onSubmit={handleSubmit}
      isSubmitting={false}
    />
  )
}
```

## Props

### VideoGenerationFormProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onSubmit` | `(data: VideoGenerationRequest) => Promise<void>` | Yes | Function called when form is submitted with valid data |
| `isSubmitting` | `boolean` | No | Controls loading state of submit button (default: false) |

## Validation Rules

- **Topic**: Required, minimum 3 characters
- **Platforms**: At least one platform must be selected
- **Style**: Optional string
- **Target Audience**: Optional string

## Components Used

- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` from shadcn/ui
- `Input`, `Textarea`, `Button`, `Checkbox` from shadcn/ui
- `Loader2` icon from lucide-react

## Dependencies

- react-hook-form
- @hookform/resolvers
- zod
- lucide-react
- class-variance-authority
- clsx
- tailwind-merge

## Example Response

When form is submitted, the data structure follows the `VideoGenerationRequest` interface:

```typescript
{
  topic: "How to make coffee",
  platforms: ["tiktok", "reels"],
  style: "Educational",
  targetAudience: "Coffee enthusiasts and beginners"
}
```