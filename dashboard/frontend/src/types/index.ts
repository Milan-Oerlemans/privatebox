export interface GpuMetrics {
  usagePercent: number;
  temperatureC: number;
  powerW?: number;
}

export interface CpuMetrics {
  usagePercent: number;
}

export interface MemoryMetrics {
  totalKB: number;
  usedKB: number;
  freeKB: number;
}

export interface TemperatureMetrics {
  systemTemperatureC: number;
}

export interface DockerContainer {
  id: string;
  names: string;
  image: string;
  status: string;
  ports: string;
  cpu: string;
  memory: string;
}

export interface DashboardData {
  gpu: GpuMetrics | null;
  cpu: CpuMetrics;
  temperature: TemperatureMetrics;
  memory: MemoryMetrics;
  docker: DockerContainer[];
  nextPollSeconds: number;
}

export interface PendingCommand {
  command: string;
  timestamp: number;
  wasRunning: boolean;
}
