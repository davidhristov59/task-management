import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';

// This is a test component to verify responsivity improvements
export function ResponsiveTest() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-responsive-xl font-bold">Responsivity Test</h1>
      
      {/* Test grid layout */}
      <div className="grid-responsive-cards gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="container-safe">
            <CardHeader>
              <CardTitle className="text-truncate-responsive">
                Very Long Card Title That Should Truncate Properly on Mobile Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="card-content-safe">
                This is a very long description that should break words properly and not overflow the card boundaries. It should be responsive across all screen sizes.
              </p>
              <div className="actions-container mt-4">
                <Button className="btn-responsive">Primary Action</Button>
                <Button variant="outline" className="btn-responsive">Secondary</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge>Tag 1</Badge>
                <Badge>Very Long Tag Name</Badge>
                <Badge>Tag 3</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Test stats grid */}
      <div className="grid-responsive-stats gap-4">
        <div className="bg-white p-4 rounded-lg border container-safe">
          <div className="text-2xl font-bold text-blue-600">123</div>
          <div className="text-sm text-gray-600 truncate">Total Items with Long Name</div>
        </div>
        <div className="bg-white p-4 rounded-lg border container-safe">
          <div className="text-2xl font-bold text-green-600">45</div>
          <div className="text-sm text-gray-600 truncate">Completed Tasks</div>
        </div>
        <div className="bg-white p-4 rounded-lg border container-safe">
          <div className="text-2xl font-bold text-yellow-600">67</div>
          <div className="text-sm text-gray-600 truncate">Pending Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg border container-safe">
          <div className="text-2xl font-bold text-red-600">89</div>
          <div className="text-sm text-gray-600 truncate">Overdue Tasks</div>
        </div>
      </div>
      
      {/* Test flexible layout */}
      <Card className="container-safe">
        <CardHeader>
          <div className="flex-responsive items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-truncate-responsive">
                Flexible Layout Test with Very Long Title That Should Wrap
              </CardTitle>
            </div>
            <div className="actions-container flex-shrink-0">
              <Button size="sm">Edit</Button>
              <Button size="sm" variant="outline">Delete</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex-responsive spacing-safe">
            <div className="flex-1 min-w-0">
              <p className="card-content-safe">
                This content should adapt to different screen sizes and never overflow its container.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Badge>Status</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}