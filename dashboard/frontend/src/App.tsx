import { useState, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { StatusHeader } from './components/StatusHeader';
import { LogoSection } from './components/sections/LogoSection';
import { GraphicSection } from './components/sections/GraphicSection';
import { MemorySection } from './components/sections/MemorySection';
import { CpuGpuSection } from './components/sections/CpuGpuSection';
import { TempSection } from './components/sections/TempSection';
import { DockerSection } from './components/sections/DockerSection';

const HISTORY_SIZE = 10;

function App() {
  const { data, status, smiCrashed, pendingCommands, sendCommand } = useDashboardData();

  const [history, setHistory] = useState({
    gpu: [] as number[],
    cpu: [] as number[],
    gpuTemp: [] as number[],
    sysTemp: [] as number[],
    memory: [] as number[],
  });

  useEffect(() => {
    if (!data) return;

    setHistory(prev => {
      const nextGpu = [...prev.gpu, data.gpu?.usagePercent || 0];
      const nextCpu = [...prev.cpu, data.cpu.usagePercent];
      const nextGpuTemp = [...prev.gpuTemp, data.gpu?.temperatureC || 0];
      const nextSysTemp = [...prev.sysTemp, data.temperature.systemTemperatureC];
      const nextMemory = [...prev.memory, parseFloat((data.memory.usedKB / 1000000).toFixed(1))];

      if (nextGpu.length > HISTORY_SIZE) nextGpu.shift();
      if (nextCpu.length > HISTORY_SIZE) nextCpu.shift();
      if (nextGpuTemp.length > HISTORY_SIZE) nextGpuTemp.shift();
      if (nextSysTemp.length > HISTORY_SIZE) nextSysTemp.shift();
      if (nextMemory.length > HISTORY_SIZE) nextMemory.shift();

      return {
        gpu: nextGpu,
        cpu: nextCpu,
        gpuTemp: nextGpuTemp,
        sysTemp: nextSysTemp,
        memory: nextMemory,
      };
    });

    // Update Document Title
    const usedGB = data.memory.usedKB / 1000000;
    const maxUsage = Math.max(data.gpu?.usagePercent ?? 0, data.cpu.usagePercent);
    const maxTemp = Math.max(data.gpu?.temperatureC ?? 0, data.temperature.systemTemperatureC);
    document.title = `DGX ${Math.trunc(usedGB).toFixed(0)}GB ${maxUsage.toFixed(0)}% ${maxTemp.toFixed(0)}°`;

  }, [data]);

  return (
    <div className="h-screen w-screen overflow-y-auto snap-y snap-mandatory bg-gray-50/50 font-sans text-gray-900 scroll-smooth">
      <StatusHeader 
        status={status} 
        smiCrashed={smiCrashed} 
        nextPollSeconds={data?.nextPollSeconds} 
      />

      <LogoSection />
      {/* Passing gpuUsage prop, defaulting to 0 if data is null */}
      <GraphicSection gpuUsage={data?.gpu?.usagePercent || 0} />
      
      {data && (
        <>
          <MemorySection memory={data.memory} history={history.memory} />
          <CpuGpuSection gpu={data.gpu} cpu={data.cpu} history={history} />
          <TempSection temperature={data.temperature} history={history} />
          <DockerSection 
            containers={data.docker} 
            pendingCommands={pendingCommands} 
            onCommand={sendCommand} 
          />
        </>
      )}
    </div>
  );
}

export default App;
