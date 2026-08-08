'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TreeNodeData {
  id: string;
  name: string | null;
  username: string;
  referralCode: string;
  status: string;
  createdAt: string;
  activeInvestment: number;
  children?: TreeNodeData[];
}

export default function GenealogyPage() {
  const [root, setRoot] = useState<TreeNodeData | null>(null);
  const [tree, setTree] = useState<TreeNodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchGenealogyData();
  }, []);

  const fetchGenealogyData = async () => {
    try {
      const res = await fetch('/api/genealogy');
      if (res.ok) {
        const data = await res.json();
        setRoot(data.root || null);
        setTree(data.tree || []);
      }
    } catch (err) {
      console.error('Failed to fetch genealogy data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const copyRefLink = () => {
    if (!root?.referralCode) return;
    const link = `${window.location.origin}/register?ref=${root.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Flatten tree for table view with level calculation
  const getFlattenedMembers = (nodes: TreeNodeData[], level = 1): Array<TreeNodeData & { level: number }> => {
    let result: Array<TreeNodeData & { level: number }> = [];
    for (const node of nodes) {
      result.push({ ...node, level });
      if (node.children && node.children.length > 0) {
        result = result.concat(getFlattenedMembers(node.children, level + 1));
      }
    }
    return result;
  };

  const flattenedList = getFlattenedMembers(tree);
  const filteredList = flattenedList.filter(m => 
    !search || 
    m.username.toLowerCase().includes(search.toLowerCase()) || 
    (m.name && m.name.toLowerCase().includes(search.toLowerCase())) ||
    m.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
        <span>Loading genealogy tree...</span>
      </div>
    );
  }

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TreeNodeData, depth = 1) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id] ?? true;

    return (
      <div key={node.id} className="flex flex-col items-center relative my-2">
        {/* Node Card */}
        <div className="p-3 sm:p-4 border border-border rounded-xl shadow-sm text-center bg-white dark:bg-slate-900 min-w-[180px] max-w-[220px] transition-all hover:border-primary">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
              {node.name || node.username}
            </span>
            <Badge variant={node.status === 'ACTIVE' ? 'success' : 'danger'} className="text-[10px] px-1.5 py-0">
              {node.status}
            </Badge>
          </div>
          <p className="text-xs font-mono text-slate-400">@{node.username}</p>
          <div className="mt-2 pt-2 border-t border-border/50 text-xs flex justify-between items-center text-slate-400">
            <span>Investment:</span>
            <span className="font-bold text-emerald-500">${node.activeInvestment.toFixed(2)}</span>
          </div>

          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="mt-2 text-[11px] text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <span>{isExpanded ? '▲ Collapse' : '▼ Expand'} ({node.children?.length})</span>
            </button>
          )}
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center mt-4 w-full">
            <div className="w-0.5 h-4 bg-border" />
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 pt-2 border-t border-border/60 relative w-full">
              {node.children?.map(child => renderTreeNode(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Genealogy Tree</h1>
          <p className="text-sm text-muted mt-1">Visualize your multi-level downline team structure in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'tree' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setViewMode('tree')}
          >
            🌳 Tree View
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setViewMode('table')}
          >
            📋 List View ({flattenedList.length})
          </Button>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'tree' ? (
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-base sm:text-lg">Network Hierarchy</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 overflow-x-auto min-h-[400px]">
            <div className="flex flex-col items-center min-w-[600px] py-4">
              {/* Root Node (Logged in User) */}
              {root ? (
                <div className="flex flex-col items-center mb-4">
                  <div className="p-4 border-2 border-primary/80 rounded-2xl shadow-lg text-center bg-indigo-50/50 dark:bg-indigo-950/30 min-w-[220px]">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="font-bold text-base text-gray-900 dark:text-white">
                        {root.name || root.username} (You)
                      </span>
                      <Badge variant={root.status === 'ACTIVE' ? 'success' : 'danger'} className="text-[10px]">
                        {root.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-slate-400">@{root.username}</p>
                    <div className="mt-2 pt-2 border-t border-border/50 text-xs flex justify-between items-center">
                      <span className="text-slate-400">Active Investment:</span>
                      <span className="font-bold text-emerald-500 text-sm">${root.activeInvestment.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 text-xs flex justify-between items-center text-slate-400">
                      <span>Direct Team:</span>
                      <span className="font-bold text-primary">{tree.length} Members</span>
                    </div>
                  </div>

                  {tree.length > 0 && <div className="w-0.5 h-6 bg-primary" />}
                </div>
              ) : null}

              {/* Direct Downlines */}
              {tree.length === 0 ? (
                <div className="text-center py-10 space-y-3 max-w-sm">
                  <p className="text-4xl">👥</p>
                  <h3 className="font-bold text-gray-900 dark:text-white">No Downline Team Members Yet</h3>
                  <p className="text-xs text-muted">
                    Share your exclusive referral link to invite new members and start earning multi-level commissions!
                  </p>
                  <Button onClick={copyRefLink} variant="primary" size="sm" className="w-full">
                    {copied ? '✓ Link Copied!' : '📋 Copy Referral Link'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-2 border-t-2 border-primary/40 relative w-full">
                  {tree.map(node => renderTreeNode(node))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Table View */
        <Card>
          <CardHeader className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base sm:text-lg">Downline Team Members ({filteredList.length})</CardTitle>
            <Input 
              placeholder="Search team member..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="max-w-xs text-xs py-2"
            />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {filteredList.length === 0 ? (
              <div className="text-center py-8 text-muted">
                <p className="text-3xl mb-1">🔍</p>
                <p className="text-sm">No downline members matching search.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">Active Investment</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((m) => (
                      <tr key={m.id} className="border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3">
                          <Badge variant="info" className="text-xs">Level {m.level}</Badge>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">{m.name || 'Member'}</td>
                        <td className="py-2.5 px-3 font-mono text-xs">@{m.username}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-500">${m.activeInvestment.toFixed(2)}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant={m.status === 'ACTIVE' ? 'success' : 'danger'}>{m.status}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted">{new Date(m.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
