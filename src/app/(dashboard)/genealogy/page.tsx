'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GenealogyPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Genealogy Tree</h1>
      
      <Card>
        <CardHeader className="p-4 sm:p-6"><CardTitle>Tree View</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 overflow-x-auto">
          <div className="flex flex-col items-center min-w-[500px]">
            <div className="p-4 border border-border rounded-xl shadow-sm text-center bg-blue-50 dark:bg-blue-900/20">
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
