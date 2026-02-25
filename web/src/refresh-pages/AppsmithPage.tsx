"use client";

import * as AppLayouts from "@/layouts/app-layouts";
import BackButton from "@/refresh-components/buttons/BackButton";
import { useRouter } from "next/navigation";
import Text from "@/refresh-components/texts/Text";

interface AppsmithPageProps {
  appsmithUrl: string;
}

export default function AppsmithPage({ appsmithUrl }: AppsmithPageProps) {
  const router = useRouter();

  return (
    <AppLayouts.Root>
      <div className="w-full h-full flex flex-col">
        <div className="flex-none p-4 border-b border-border-01 bg-background-tint-01 flex items-center gap-4">
          <BackButton behaviorOverride={() => router.push("/app/apps")} />
          <Text headingH3>Appsmith</Text>
        </div>
        <iframe
          src={appsmithUrl}
          className="w-full h-full border-none"
          title="Appsmith"
          allow="clipboard-read; clipboard-write; camera; microphone; geolocation"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-presentation allow-modals"
        />
      </div>
    </AppLayouts.Root>
  );
}
