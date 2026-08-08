'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GenealogyPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Genealogy Tree</h1>
      
      <Card>
        <CardHeader><CardTitle>Tree View</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="p-4 border rounded shadow-md text-center bg-blue-50">
              <p className="font-bold">You (Root)</p>
              <p className="text-sm">Active Investment: $500</p>
            </div>
            
            <div className="flex gap-16 mt-8 relative">
              <div className="p-4 border rounded shadow-md text-center">
                <p className="font-bold">User A</p>
                <p className="text-sm">Team Size: 5</p>
              </div>
              <div className="p-4 border rounded shadow-md text-center">
                <p className="font-bold">User B</p>
                <p className="text-sm">Team Size: 2</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
