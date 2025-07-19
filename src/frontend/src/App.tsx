import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

function App() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            AI Video Pipeline - UI Test
          </h1>
          <p className="text-muted-foreground text-lg">
            shadcn/ui components successfully integrated!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="destructive">Destructive Button</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 font-medium">
                ✅ All shadcn/ui components are working!
              </p>
              <p className="text-muted-foreground mt-2">
                The UI framework has been successfully integrated with:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Radix UI primitives</li>
                <li>Tailwind CSS styling</li>
                <li>Class variance authority</li>
                <li>Lucide React icons</li>
                <li>TypeScript support</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The UI framework is now ready for the full AI Video Pipeline application. 
              You can now implement the complete interface with all the video generation features.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App; 