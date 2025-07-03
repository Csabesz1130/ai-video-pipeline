import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Brain, 
  Video, 
  TrendingUp, 
  BarChart3, 
  Settings, 
  Users, 
  Zap, 
  FileText,
  Calendar,
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  PlayCircle,
  Database,
  Cloud,
  Bot
} from 'lucide-react';

interface NavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: string;
  children?: NavigationItem[];
  active?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    active: true
  },
  {
    title: 'Projects',
    icon: Video,
    badge: '4',
    children: [
      { title: 'All Projects', icon: PlayCircle, href: '/projects' },
      { title: 'Active', icon: Zap, href: '/projects/active', badge: '2' },
      { title: 'Completed', icon: FileText, href: '/projects/completed' },
      { title: 'Templates', icon: Database, href: '/projects/templates' }
    ]
  },
  {
    title: 'AI Engine',
    icon: Brain,
    children: [
      { title: 'Models', icon: Bot, href: '/ai/models' },
      { title: 'Training', icon: TrendingUp, href: '/ai/training' },
      { title: 'Pipelines', icon: Zap, href: '/ai/pipelines', badge: '3' }
    ]
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    badge: 'New'
  },
  {
    title: 'Trends',
    icon: TrendingUp,
    children: [
      { title: 'Social Media', icon: Users, href: '/trends/social' },
      { title: 'Content Analysis', icon: FileText, href: '/trends/content' },
      { title: 'Predictions', icon: TrendingUp, href: '/trends/predictions' }
    ]
  },
  {
    title: 'Scheduling',
    icon: Calendar,
    href: '/scheduling'
  },
  {
    title: 'Cloud Storage',
    icon: Cloud,
    href: '/storage'
  }
];

const bottomItems: NavigationItem[] = [
  {
    title: 'Notifications',
    icon: Bell,
    href: '/notifications',
    badge: '3'
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings'
  }
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
}

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Projects', 'AI Engine']);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const Icon = item.icon;

    return (
      <div key={item.title} className="space-y-1">
        <Button
          variant={item.active ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-9 px-3",
            level > 0 && "ml-4 w-[calc(100%-1rem)]",
            collapsed && level === 0 && "px-2 justify-center"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.title);
            }
          }}
        >
          <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-1" />
                  )}
                </>
              )}
            </>
          )}
        </Button>
        
        {hasChildren && isExpanded && !collapsed && (
          <div className="space-y-1 ml-2">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-background border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-sm">AI Pipeline</h1>
              <p className="text-xs text-muted-foreground">Video Generation</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="space-y-1">
          {navigationItems.map(item => renderNavigationItem(item))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-1">
          {bottomItems.map(item => renderNavigationItem(item))}
        </div>
      </div>

      {/* Status indicator */}
      {!collapsed && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">All systems operational</span>
          </div>
        </div>
      )}
    </div>
  );
}