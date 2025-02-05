import { UploadCloud } from 'lucide-react'; // Changed from Upload to UploadCloud
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { useDurableObject } from '~/lib/core/durable-object';
import { useWebsocket } from '~/lib/core/websocket';
import type { Data } from '~/types/schema';

export function LlamaFileDashboard() {
  const data = useDurableObject() as Data;
  const [stats, setStats] = useState(data.stats);
  const [workers, setWorkers] = useState(data.workers);
  const [uploading, setUploading] = useState(false);

  interface StatsUpdate {
    type: 'stats_update';
    stats: Data['stats'];
  }

  interface WorkerUpdate {
    type: 'worker_update';
    workers: Data['workers'];
  }

  type Update = StatsUpdate | WorkerUpdate;

  const sendMessage = useWebsocket((event: MessageEvent) => {
    const update: Update = JSON.parse(event.data);
    if (update.type === 'stats_update') {
      setStats(update.stats);
    } else if (update.type === 'worker_update') {
      setWorkers(update.workers);
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('model', file);
    formData.append('config', JSON.stringify({
      id: crypto.randomUUID(),
      name: file.name,
      maxTokens: 2048,
      modelSize: file.size,
      costPerToken: 0.000001,
      active: true
    }));

    try {
      await fetch('/upload', {
        method: 'POST',
        body: formData
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>Total Cost</CardHeader>
          <CardContent className="text-2xl font-bold">
            ${stats.totalCost.toFixed(4)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Total Tokens</CardHeader>
          <CardContent className="text-2xl font-bold">
            {stats.totalTokens.toLocaleString()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Active Workers</CardHeader>
          <CardContent className="text-2xl font-bold">
            {workers.length}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>Upload LlamaFile</CardHeader>
        <CardContent>
          <label className="flex flex-col items-center p-4 border-2 border-dashed rounded-lg cursor-pointer">
            <UploadCloud className="w-8 h-8 mb-2" />
            <span>Drop your LlamaFile here or click to browse</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".gguf"
              disabled={uploading}
            />
          </label>
          {uploading && <Progress value={0} className="mt-4" />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>Worker Status</CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {workers.map(worker => (
              <div key={worker.id} className="flex items-center justify-between">
                <span>Worker {worker.id}</span>
                <Progress 
                  value={worker.load} 
                  className="w-48"
                />
                <span className="ml-2">{`${worker.load}% Load`}</span>
                <span className="text-sm text-gray-500">
                  Last heartbeat: {new Date(worker.lastHeartbeat).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}