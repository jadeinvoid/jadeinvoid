import { createContext, useContext, type ReactNode } from 'react'
import type { UiCategoryId } from '../ui-lab/categories'
import type { WorkListCategory } from '../figma-lab/workListData'

export type PortfolioContent = Record<UiCategoryId, WorkListCategory>

interface PortfolioContentValue {
  content: PortfolioContent
}

const PortfolioContentContext = createContext<PortfolioContentValue | null>(null)

interface PortfolioContentProviderProps {
  children: ReactNode
  initialContent: PortfolioContent
}

export function PortfolioContentProvider({ children, initialContent }: PortfolioContentProviderProps) {
  return (
    <PortfolioContentContext.Provider value={{ content: initialContent }}>
      {children}
    </PortfolioContentContext.Provider>
  )
}

export function usePortfolioContent() {
  const value = useContext(PortfolioContentContext)
  if (!value) throw new Error('usePortfolioContent must be used within PortfolioContentProvider')
  return value
}
