"use client";

import { useState, useMemo } from "react";
import * as SettingsLayouts from "@/layouts/settings-layouts";
import InputTypeIn from "@/refresh-components/inputs/InputTypeIn";
import Text from "@/refresh-components/texts/Text";
import { Card } from "@/refresh-components/cards";
import { LineItemLayout } from "@/layouts/general-layouts";
import Button from "@/refresh-components/buttons/Button";
import {
  SvgOnyxOctagon,
  SvgDownload,
  SvgStar,
  SvgTag,
  SvgLoader,
  SvgCheck,
} from "@opal/icons";
import { cn } from "@/lib/utils";

// 1. Define Types & Mock Data
interface MarketplaceApp {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  rating: number;
  reviews: number;
  isInstalled?: boolean;
}

const MOCK_APPS: MarketplaceApp[] = [
  {
    id: "slack",
    name: "Slack",
    description:
      "Connect your team conversations and collaboration in one place.",
    logo: "/Slack.png",
    category: "Communication",
    rating: 4.8,
    reviews: 1240,
    isInstalled: true,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Track issues, manage projects, and automate workflows.",
    logo: "/Jira.svg",
    category: "Project Management",
    rating: 4.5,
    reviews: 856,
  },
  {
    id: "github",
    name: "GitHub",
    description: "The world's leading AI-powered developer platform.",
    logo: "/Github.png",
    category: "Developer Tools",
    rating: 4.9,
    reviews: 2100,
    isInstalled: true,
  },
  {
    id: "notion",
    name: "Notion",
    description: "The all-in-one workspace for your notes, tasks, and wikis.",
    logo: "/Notion.png",
    category: "Productivity",
    rating: 4.7,
    reviews: 934,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description:
      "A CRM platform with all the software, integrations, and resources you need.",
    logo: "/HubSpot.png",
    category: "CRM",
    rating: 4.6,
    reviews: 642,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description:
      "The world's #1 CRM. Connect with your customers in a whole new way.",
    logo: "/Salesforce.png",
    category: "CRM",
    rating: 4.4,
    reviews: 1530,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description:
      "Store, share, and collaborate on files and folders from any mobile device.",
    logo: "/GoogleDrive.png",
    category: "File Storage",
    rating: 4.3,
    reviews: 1120,
  },
  {
    id: "confluence",
    name: "Confluence",
    description:
      "A workspace where teams can create, collaborate, and organize all their work.",
    logo: "/Confluence.svg",
    category: "Knowledge Base",
    rating: 4.2,
    reviews: 430,
  },
  {
    id: "asana",
    name: "Asana",
    description: "Manage your team's work, projects, and tasks online.",
    logo: "/Asana.png",
    category: "Project Management",
    rating: 4.5,
    reviews: 320,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Securely share, sync, and collaborate on files.",
    logo: "/Dropbox.png",
    category: "File Storage",
    rating: 4.4,
    reviews: 512,
  },
];

// Helper for Star Rating
function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex flex-row items-center gap-1">
      <div className="flex flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <SvgStar
            key={star}
            size={12}
            className={cn(
              star <= Math.round(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-text-04"
            )}
          />
        ))}
      </div>
      <Text text03 className="text-xs">
        ({count})
      </Text>
    </div>
  );
}

// 2. Marketplace App Card Component
function MarketplaceAppCard({ app }: { app: MarketplaceApp }) {
  const [loading, setLoading] = useState(false);
  const [installed, setInstalled] = useState(app.isInstalled);

  const handleInstall = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setInstalled(!installed);
    }, 1000);
  };

  return (
    <Card padding={0} gap={0} height="full" className="overflow-hidden">
      {/* Top Section: Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <div className="flex flex-row gap-3">
          {/* Logo Container */}
          <div className="flex-none w-12 h-12 rounded-lg bg-background-neutral-01 border border-border-01 flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={app.logo}
              alt={app.name}
              className="w-full h-full object-contain"
            />
          </div>
          {/* Title & Desc */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex flex-row justify-between items-start">
              <Text as="p" className="font-main-ui-body font-medium truncate">
                {app.name}
              </Text>
              <StarRating rating={app.rating} count={app.reviews} />
            </div>
            <Text
              text03
              className="text-sm line-clamp-2 leading-snug mt-1 h-[2.5em]"
            >
              {app.description}
            </Text>
          </div>
        </div>
      </div>

      {/* Footer Section: Actions */}
      <div className="bg-background-tint-01 p-2 flex flex-row items-center justify-between w-full border-t border-border-01">
        {/* Category */}
        <div className="px-1">
          <LineItemLayout icon={SvgTag} title={app.category} variant="mini" />
        </div>

        {/* Install Button */}
        <div>
          <Button
            size="md"
            // Use boolean flags for styling
            primary={!installed}
            tertiary={installed}
            onClick={handleInstall}
            disabled={loading}
            leftIcon={loading ? SvgLoader : installed ? SvgCheck : SvgDownload}
          >
            {loading ? "Installing..." : installed ? "Installed" : "Install"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApps = useMemo(() => {
    if (!searchTerm) return MOCK_APPS;
    const lowerTerm = searchTerm.toLowerCase();
    return MOCK_APPS.filter(
      (app) =>
        app.name.toLowerCase().includes(lowerTerm) ||
        app.category.toLowerCase().includes(lowerTerm) ||
        app.description.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm]);

  const featuredApps = filteredApps.filter((app) => app.rating >= 4.7);
  const otherApps = filteredApps.filter((app) => app.rating < 4.7);

  return (
    <SettingsLayouts.Root>
      <SettingsLayouts.Header
        icon={SvgOnyxOctagon}
        title="App Marketplace"
        description="Discover and install third-party integrations and plugins."
      >
        <div className="max-w-md mt-4">
          <InputTypeIn
            placeholder="Search marketplace..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftSearchIcon
            className="w-full"
          />
        </div>
      </SettingsLayouts.Header>

      <SettingsLayouts.Body>
        {/* Featured Section */}
        {featuredApps.length > 0 && (
          <div className="flex flex-col gap-4 mb-8">
            <div>
              <Text as="p" headingH3>
                Featured Apps
              </Text>
              <Text as="p" secondaryBody text03>
                Top rated integrations curated for you.
              </Text>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredApps.map((app) => (
                <MarketplaceAppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        )}

        {/* All Apps Section */}
        {otherApps.length > 0 && (
          <div className="flex flex-col gap-4">
            <div>
              <Text as="p" headingH3>
                All Apps
              </Text>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherApps.map((app) => (
                <MarketplaceAppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        )}

        {filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Text headingH3>No apps found</Text>
            <Text text03>Try adjusting your search terms</Text>
          </div>
        )}
      </SettingsLayouts.Body>
    </SettingsLayouts.Root>
  );
}
