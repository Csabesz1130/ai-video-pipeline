import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GenerateVideoPage from './pages/GenerateVideo';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { YouTubeScriptGenerator, ScriptResponse, ScriptSection } from '../../services/script-generation/youtubeScriptGenerator';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-foreground">AI Video Pipeline</h1>
                </div>
                <div className="hidden sm:flex sm:space-x-2">
                  <Link to="/">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link to="/generate">
                    <Button variant="ghost">Create Video</Button>
                  </Link>
                  <Link to="/script-generator">
                    <Button variant="ghost">Script Generator</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<GenerateVideoPage />} />
            <Route path="/script-generator" element={<ScriptGenerator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const ScriptGenerator: React.FC = () => {
  const [topic, setTopic] = React.useState('');
  const [niche, setNiche] = React.useState<'finance' | 'motivation' | 'top_lists' | 'education'>('education');
  const [targetAudience, setTargetAudience] = React.useState('');
  const [keywords, setKeywords] = React.useState('');
  const [script, setScript] = React.useState<ScriptResponse | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const generator = new YouTubeScriptGenerator();
      const result = await generator.generateScript(
        topic,
        niche,
        targetAudience,
        keywords.split(',').map(k => k.trim())
      );
      setScript(result);
    } catch (error) {
      console.error('Failed to generate script:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Script Generator</CardTitle>
        <CardDescription>
          Generate optimized YouTube video scripts using AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Niche</label>
            <Select
              value={niche}
              onValueChange={(value) => setNiche(value as 'finance' | 'motivation' | 'top_lists' | 'education')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="motivation">Motivation</SelectItem>
                <SelectItem value="top_lists">Top Lists</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Audience</label>
            <Input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords (comma-separated)</label>
            <Input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Script'}
          </Button>
        </form>

        {script && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Generated Script</h3>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-bold">{script.script.title}</h4>
              <div className="mt-4">
                <h5 className="font-semibold">Hook:</h5>
                <p className="text-muted-foreground">{script.script.hook}</p>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold">Preview:</h5>
                <p className="text-muted-foreground">{script.script.preview}</p>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold">Main Sections:</h5>
                {script.script.main_sections.map((section: ScriptSection, index: number) => (
                  <div key={index} className="mt-2">
                    <h6 className="font-medium">{section.section_title}</h6>
                    <p className="text-muted-foreground">{section.content}</p>
                    <p className="text-sm text-muted-foreground">Retention Hook: {section.retention_hook}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <h5 className="font-semibold">Conclusion:</h5>
                <p className="text-muted-foreground">{script.script.conclusion}</p>
              </div>
              <div className="mt-4">
                <h5 className="font-semibold">Call to Action:</h5>
                <p className="text-muted-foreground">{script.script.call_to_action}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default App; 