"use client";

import * as AppLayouts from "@/layouts/app-layouts";
import BackButton from "@/refresh-components/buttons/BackButton";
import { useRouter } from "next/navigation";
import Text from "@/refresh-components/texts/Text";

interface N8NPageProps {
  n8nUrl: string;
}

export default function N8NPage({ n8nUrl }: N8NPageProps) {
  const router = useRouter();

  return (
    <AppLayouts.Root>
      <div className="w-full h-full flex flex-col">
        <div className="flex-none p-4 border-b border-border-01 bg-background-tint-01 flex items-center gap-4">
          <BackButton behaviorOverride={() => router.push("/app/apps")} />
          <Text headingH3>n8n Automation</Text>
        </div>
        <iframe
          src={n8nUrl}
          className="w-full h-full border-none"
          title="N8N Automation"
          allow="clipboard-read; clipboard-write"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-presentation"
        />
      </div>
    </AppLayouts.Root>
  );
}
