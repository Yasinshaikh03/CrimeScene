export type ActiveTab = 'video-analysis' | 'photo-analysis'

export interface NavigationProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}
