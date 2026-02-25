import AppsPage from "@/refresh-pages/AppsPage";
import * as AppLayouts from "@/layouts/app-layouts";

export default async function Page() {
  return (
    <AppLayouts.Root>
      <AppsPage />
    </AppLayouts.Root>
  );
}
