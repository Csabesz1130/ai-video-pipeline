import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { YouTubeScriptGenerator, ScriptResponse, ScriptSection } from '../../services/script-generation/youtubeScriptGenerator';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-800">AI Video Pipeline</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                    Home
                  </Link>
                  <Link to="/script-generator" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300">
                    Script Generator
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/script-generator" element={<ScriptGenerator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const Home: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to AI Video Pipeline</h2>
      <p className="text-gray-600">
        This application helps you create engaging YouTube content using AI-powered tools.
        Get started by using our Script Generator to create optimized video scripts.
      </p>
    </div>
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
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Script Generator</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Niche</label>
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value as 'finance' | 'motivation' | 'top_lists' | 'education')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="finance">Finance</option>
            <option value="motivation">Motivation</option>
            <option value="top_lists">Top Lists</option>
            <option value="education">Education</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Target Audience</label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Keywords (comma-separated)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Generating...' : 'Generate Script'}
        </button>
      </form>

      {script && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Generated Script</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-bold">{script.script.title}</h4>
            <div className="mt-4">
              <h5 className="font-semibold">Hook:</h5>
              <p className="text-gray-700">{script.script.hook}</p>
            </div>
            <div className="mt-4">
              <h5 className="font-semibold">Preview:</h5>
              <p className="text-gray-700">{script.script.preview}</p>
            </div>
            <div className="mt-4">
              <h5 className="font-semibold">Main Sections:</h5>
              {script.script.main_sections.map((section: ScriptSection, index: number) => (
                <div key={index} className="mt-2">
                  <h6 className="font-medium">{section.section_title}</h6>
                  <p className="text-gray-700">{section.content}</p>
                  <p className="text-sm text-gray-500">Retention Hook: {section.retention_hook}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h5 className="font-semibold">Conclusion:</h5>
              <p className="text-gray-700">{script.script.conclusion}</p>
            </div>
            <div className="mt-4">
              <h5 className="font-semibold">Call to Action:</h5>
              <p className="text-gray-700">{script.script.call_to_action}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App; 