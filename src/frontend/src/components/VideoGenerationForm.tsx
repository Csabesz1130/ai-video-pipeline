import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Play, 
  Settings, 
  Palette, 
  Music, 
  Users, 
  Clock, 
  BookOpen,
  Sparkles,
  Youtube,
  Instagram,
  MonitorPlay
} from 'lucide-react';

interface VideoGenerationRequest {
  topic: string;
  platforms: ('tiktok' | 'reels' | 'shorts')[];
  style?: string;
  targetAudience?: string;
  duration?: number;
  educationalContent?: boolean;
  visualPreferences?: {
    colorScheme?: string;
    styleReference?: string;
  };
  audioPreferences?: {
    voiceStyle?: string;
    musicGenre?: string;
  };
  autoDistribute?: boolean;
}

interface VideoGenerationFormProps {
  onSubmit: (request: VideoGenerationRequest) => void;
  isGenerating?: boolean;
  progress?: number;
}

export function VideoGenerationForm({ onSubmit, isGenerating = false, progress = 0 }: VideoGenerationFormProps) {
  const [formData, setFormData] = useState<VideoGenerationRequest>({
    topic: '',
    platforms: [],
    style: '',
    targetAudience: '',
    duration: 30,
    educationalContent: false,
    visualPreferences: {
      colorScheme: '',
      styleReference: ''
    },
    audioPreferences: {
      voiceStyle: '',
      musicGenre: ''
    },
    autoDistribute: false
  });

  const handleInputChange = (field: keyof VideoGenerationRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: keyof VideoGenerationRequest, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] as any,
        [field]: value
      }
    }));
  };

  const togglePlatform = (platform: 'tiktok' | 'reels' | 'shorts') => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const platformConfig = [
    { id: 'tiktok', name: 'TikTok', icon: MonitorPlay, color: 'bg-black text-white' },
    { id: 'reels', name: 'Instagram Reels', icon: Instagram, color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
    { id: 'shorts', name: 'YouTube Shorts', icon: Youtube, color: 'bg-red-600 text-white' }
  ];

  if (isGenerating) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 animate-spin" />
            Generating Your Video
          </CardTitle>
          <CardDescription>
            AI is creating amazing content for your audience...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className={`p-3 rounded-lg ${progress > 20 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
              <BookOpen className="h-5 w-5 mx-auto mb-1" />
              <div className="text-xs">Script Generation</div>
            </div>
            <div className={`p-3 rounded-lg ${progress > 60 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
              <Palette className="h-5 w-5 mx-auto mb-1" />
              <div className="text-xs">Visual Creation</div>
            </div>
            <div className={`p-3 rounded-lg ${progress > 90 ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
              <Music className="h-5 w-5 mx-auto mb-1" />
              <div className="text-xs">Audio Synthesis</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          AI Video Pipeline
        </CardTitle>
        <CardDescription>
          Create engaging social media content powered by AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
              <TabsTrigger value="visual">Visual</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic *</label>
                <Input
                  placeholder="Enter your video topic (e.g., 'AI in healthcare', 'Cooking tips', 'Tech trends')"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Target Audience
                  </label>
                  <Select
                    value={formData.targetAudience}
                    onValueChange={(value) => handleInputChange('targetAudience', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teens">Teens (13-17)</SelectItem>
                      <SelectItem value="young-adults">Young Adults (18-25)</SelectItem>
                      <SelectItem value="adults">Adults (26-40)</SelectItem>
                      <SelectItem value="professionals">Professionals</SelectItem>
                      <SelectItem value="general">General Audience</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration (seconds)
                  </label>
                  <Select
                    value={formData.duration?.toString()}
                    onValueChange={(value) => handleInputChange('duration', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="90">1.5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content Style</label>
                <Input
                  placeholder="e.g., 'Educational', 'Entertaining', 'Inspirational', 'Tutorial'"
                  value={formData.style}
                  onChange={(e) => handleInputChange('style', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="educational"
                  checked={formData.educationalContent}
                  onChange={(e) => handleInputChange('educationalContent', e.target.checked)}
                  className="rounded border-input"
                />
                <label htmlFor="educational" className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Educational Content
                </label>
              </div>
            </TabsContent>

            <TabsContent value="platforms" className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Platforms *</label>
                <div className="grid grid-cols-1 gap-3">
                  {platformConfig.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = formData.platforms.includes(platform.id as any);
                    
                    return (
                      <div
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id as any)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${platform.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{platform.name}</div>
                            <div className="text-sm text-gray-500">
                              {platform.id === 'tiktok' && 'Vertical videos, trending sounds, hashtag challenges'}
                              {platform.id === 'reels' && 'Instagram format, story-style content, music integration'}
                              {platform.id === 'shorts' && 'YouTube format, discovery optimized, longer engagement'}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="visual" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color Scheme
                  </label>
                  <Select
                    value={formData.visualPreferences?.colorScheme}
                    onValueChange={(value) => handleNestedChange('visualPreferences', 'colorScheme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vibrant">Vibrant & Energetic</SelectItem>
                      <SelectItem value="calm">Calm & Professional</SelectItem>
                      <SelectItem value="dark">Dark & Modern</SelectItem>
                      <SelectItem value="pastel">Soft & Pastel</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Style Reference</label>
                  <Input
                    placeholder="e.g., 'Minimalist', 'Cinematic', 'Cartoon'"
                    value={formData.visualPreferences?.styleReference}
                    onChange={(e) => handleNestedChange('visualPreferences', 'styleReference', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Voice Style
                  </label>
                  <Select
                    value={formData.audioPreferences?.voiceStyle}
                    onValueChange={(value) => handleNestedChange('audioPreferences', 'voiceStyle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="energetic">Energetic & Enthusiastic</SelectItem>
                      <SelectItem value="calm">Calm & Soothing</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Music Genre</label>
                  <Select
                    value={formData.audioPreferences?.musicGenre}
                    onValueChange={(value) => handleNestedChange('audioPreferences', 'musicGenre', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No background music" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upbeat">Upbeat & Electronic</SelectItem>
                      <SelectItem value="corporate">Corporate & Clean</SelectItem>
                      <SelectItem value="ambient">Ambient & Atmospheric</SelectItem>
                      <SelectItem value="hip-hop">Hip-Hop & Urban</SelectItem>
                      <SelectItem value="acoustic">Acoustic & Organic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoDistribute"
                  checked={formData.autoDistribute}
                  onChange={(e) => handleInputChange('autoDistribute', e.target.checked)}
                  className="rounded border-input"
                />
                <label htmlFor="autoDistribute" className="text-sm font-medium">
                  Auto-distribute to selected platforms
                </label>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="flex items-center gap-2"
              disabled={!formData.topic || formData.platforms.length === 0}
            >
              <Play className="h-4 w-4" />
              Generate Video
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}