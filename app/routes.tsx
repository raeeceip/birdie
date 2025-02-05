import type { RouteObject } from 'react-router-dom';
import { LlamaFileDashboard } from './components/llama/dashboard';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <LlamaFileDashboard />,
    loader: async ({ request, context }: any) => {
      const env = context.env as Env;
      const id = env.LLAMA_COORDINATOR.idFromName('global');
      const obj = env.LLAMA_COORDINATOR.get(id);
      
      return obj.fetch(request.clone());
    },
  },
];