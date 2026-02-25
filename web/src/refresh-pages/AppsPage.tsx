"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Route } from "next";
import * as SettingsLayouts from "@/layouts/settings-layouts";
import InputTypeIn from "@/refresh-components/inputs/InputTypeIn";
import Text from "@/refresh-components/texts/Text";
import {
  SvgOnyxOctagon,
  SvgSearch,
  SvgFileText,
  SvgBarChart,
  SvgCalendar,
  SvgShield,
  SvgBubbleText,
  SvgWorkflow,
} from "@opal/icons";
import type { IconProps } from "@opal/types";
import { SourceIcon } from "@/components/SourceIcon";
import { ValidSources } from "@/lib/types";

// Helper to wrap SourceIcon as an icon component
const SourceIconWrapper = (sourceType: ValidSources) => {
  const IconComponent: React.FunctionComponent<IconProps> = ({
    size,
    className,
  }) => <SourceIcon sourceType={sourceType} iconSize={size ?? 24} />;
  return IconComponent;
};

// 1. Define Types & Mock Data
interface AppMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.FunctionComponent<IconProps>;
  isPopular?: boolean;
  href?: string;
}

const MOCK_APPS: AppMetadata[] = [
  // Automation
  {
    id: "n8n",
    name: "n8n",
    category: "Automation",
    description: "Workflow automation tool.",
    icon: ({ size, className }) => (
      <img
        src="/N8N-logo-dark.svg"
        alt="N8N"
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    ),
    isPopular: true,
    href: "/app/apps/n8n",
  },
  {
    id: "appsmith",
    name: "Appsmith",
    category: "Low Code",
    description: "Build internal tools 10x faster.",
    icon: ({ size, className }) => (
      <img
        src="/appsmith-logo-no-margin.png"
        alt="Appsmith"
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    ),
    isPopular: true,
    href: "/app/apps/appsmith",
  },

  // Legal
  {
    id: "open-contracts",
    name: "Open Contracts",
    category: "Legal",
    description: "AI-powered contract analysis and review.",
    icon: ({ size, className }) => (
      <img
        src="/Open_contracts.png"
        alt="Open Contracts"
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    ),
    isPopular: true,
  },
  {
    id: "lexis-nexis",
    name: "Lexis+ AI",
    category: "Legal",
    description: "Legal research and drafting assistant.",
    icon: SvgShield,
  },

  // Engineering
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    category: "Engineering",
    description: "Your AI pair programmer.",
    icon: SourceIconWrapper(ValidSources.GitHub),
    isPopular: true,
  },
  {
    id: "jira-ai",
    name: "Jira Intelligence",
    category: "Engineering",
    description: "Accelerate work with generative AI in Jira.",
    icon: SourceIconWrapper(ValidSources.Jira),
  },

  // Productivity
  {
    id: "notion-ai",
    name: "Notion AI",
    category: "Productivity",
    description: "Write, plan, and organize with AI.",
    icon: SourceIconWrapper(ValidSources.Notion),
    isPopular: true,
  },
  {
    id: "google-workspace",
    name: "Gemini for Workspace",
    category: "Productivity",
    description: "Collaborate with AI in Docs, Sheets, and Slides.",
    icon: SourceIconWrapper(ValidSources.GoogleDrive),
  },
  {
    id: "microsoft-365",
    name: "Microsoft 365 Copilot",
    category: "Productivity",
    description: "AI assistance across Office apps.",
    icon: SvgCalendar,
  },

  // Sales & Marketing
  {
    id: "salesforce-genie",
    name: "Salesforce Genie",
    category: "Sales",
    description: "Real-time data platform for customer magic.",
    icon: SourceIconWrapper(ValidSources.Salesforce),
  },
  {
    id: "hubspot-ai",
    name: "HubSpot AI",
    category: "Sales",
    description: "AI tools for marketing, sales, and service.",
    icon: SourceIconWrapper(ValidSources.Hubspot),
  },

  // Communication
  {
    id: "slack-ai",
    name: "Slack AI",
    category: "Communication",
    description: "Summarize threads and search answers.",
    icon: SourceIconWrapper(ValidSources.Slack),
    isPopular: true,
  },
  {
    id: "zoom-ai",
    name: "Zoom AI Companion",
    category: "Communication",
    description: "Smart meeting summaries and drafting.",
    icon: SvgBubbleText,
  },
];

// 2. Local App Tile Component
function AppTile({ app }: { app: AppMetadata }) {
  const content = (
    <div
      className="
        flex flex-col items-center justify-center
        p-4 rounded-lg w-40 h-32
        cursor-pointer shadow-sm 
        bg-background-tint-00 hover:bg-background-tint-02
        transition-colors duration-200
        text-center
        h-full w-full
      "
      title={app.description}
    >
      <div className="mb-3 text-text-04">
        <app.icon size={24} />
      </div>
      <Text
        as="p"
        className="font-main-ui-body text-text-05 pt-2 line-clamp-2 leading-tight"
      >
        {app.name}
      </Text>
    </div>
  );

  if (app.href) {
    return (
      <Link href={app.href as Route} className="block w-40 h-32">
        {content}
      </Link>
    );
  }

  return <div className="w-40 h-32">{content}</div>;
}

export default function AppsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter apps based on search
  const filteredApps = useMemo(() => {
    if (!searchTerm) return MOCK_APPS;
    const lowerTerm = searchTerm.toLowerCase();
    return MOCK_APPS.filter(
      (app) =>
        app.name.toLowerCase().includes(lowerTerm) ||
        app.category.toLowerCase().includes(lowerTerm)
    );
  }, [searchTerm]);

  // Group by "Popular"
  const popularApps = useMemo(() => {
    // Only show popular section if not searching, or if search matches popular apps
    if (searchTerm) return filteredApps.filter((app) => app.isPopular);
    return MOCK_APPS.filter((app) => app.isPopular);
  }, [filteredApps, searchTerm]);

  // Group by Category
  const appsByCategory = useMemo(() => {
    const groups: Record<string, AppMetadata[]> = {};
    filteredApps.forEach((app) => {
      const list = groups[app.category] || [];
      list.push(app);
      groups[app.category] = list;
    });
    return groups;
  }, [filteredApps]);

  // Sort categories alphabetically
  const sortedCategories = useMemo(
    () => Object.keys(appsByCategory).sort(),
    [appsByCategory]
  );

  return (
    <SettingsLayouts.Root
      data-testid="AppsPage/container"
      aria-label="Apps Page"
    >
      <SettingsLayouts.Header
        icon={SvgOnyxOctagon}
        title="Apps"
        description="Explore and manage AI tools and integrations for your workspace."
      />

      <div className="w-full px-8 pb-4">
        <div className="max-w-md">
          <InputTypeIn
            placeholder="Search Apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftSearchIcon
            className="w-full"
          />
        </div>
      </div>

      <SettingsLayouts.Body>
        {/* Popular Section */}
        {popularApps.length > 0 && !searchTerm && (
          <div className="mb-8">
            <Text headingH3 className="mb-4 px-2">
              Popular
            </Text>
            <div className="flex flex-wrap gap-4">
              {popularApps.map((app) => (
                <AppTile key={app.id} app={app} />
              ))}
            </div>
          </div>
        )}

        {/* Categorized Sections */}
        {sortedCategories.length > 0 ? (
          sortedCategories.map((category) => {
            const apps = appsByCategory[category] ?? [];
            return (
              <div key={category} className="mb-8">
                <Text headingH3 className="mb-4 px-2">
                  {category}
                </Text>
                <div className="flex flex-wrap gap-4">
                  {apps.map((app) => (
                    <AppTile key={app.id} app={app} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex justify-center items-center py-12 opacity-50">
            <Text text03>No apps found matching "{searchTerm}"</Text>
          </div>
        )}
      </SettingsLayouts.Body>
    </SettingsLayouts.Root>
  );
}
