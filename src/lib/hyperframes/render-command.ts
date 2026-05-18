import { getHyperFramesRenderConfig, type HyperFramesRenderConfig } from "@/lib/hyperframes/render-config";

export type RenderCommand = { bin: string; args: string[] };

export function buildHyperFramesCommand(args: string[], config: HyperFramesRenderConfig = getHyperFramesRenderConfig()): RenderCommand {
  return { bin: config.cliBin, args: [...config.cliArgs, ...args] };
}

export function renderCommandToDisplayString(command: RenderCommand): string {
  return [command.bin, ...command.args].join(" ").trim();
}
