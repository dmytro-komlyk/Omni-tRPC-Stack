import { statsTools } from './tools/stats.tools';
import { systemTools } from './tools/system.tools';
import { usersTools } from './tools/users.tools';
import { ADMIN_TOOLS, WEBSITE_TOOLS } from './tools/whitelist';

const TOOL_REGISTRY = {
  ...usersTools,
  ...statsTools,
  ...systemTools,
};

export async function executeTool(toolName: string, args: any, isAdmin: boolean) {
  const whitelist = isAdmin ? ADMIN_TOOLS : WEBSITE_TOOLS;

  if (!whitelist.includes(toolName)) {
    return 'Error: Tool not allowed';
  }

  const tool = TOOL_REGISTRY[toolName as keyof typeof TOOL_REGISTRY];

  if (!tool) {
    return 'Error: Tool not found';
  }

  try {
    if (typeof args === 'object' && args !== null) {
      return await tool(args);
    }

    return await tool(args ?? {});
  } catch (err: any) {
    console.error('TOOL ERROR:', err);
    return `Error: ${err.message}`;
  }
}
