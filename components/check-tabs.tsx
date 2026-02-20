'use client'

import { useCallback, useOptimistic, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SingleCheck } from '@/components/single-check'
import { BulkCheck } from '@/components/bulk-check'
import { Mail, Users } from 'lucide-react'

const VALID_TABS = ['single', 'bulk'] as const
type TabValue = (typeof VALID_TABS)[number]

export function CheckTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const raw = searchParams.get('tab')
  const currentTab: TabValue = raw === 'bulk' ? 'bulk' : 'single'

  const [, startTransition] = useTransition()
  const [optimisticTab, setOptimisticTab] = useOptimistic(currentTab)

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as TabValue
      startTransition(() => {
        setOptimisticTab(tab)
        const params = new URLSearchParams(searchParams.toString())
        if (tab === 'single') {
          params.delete('tab')
        } else {
          params.set('tab', tab)
        }
        const qs = params.toString()
        router.replace(qs ? `?${qs}` : '/', { scroll: false })
      })
    },
    [router, searchParams, startTransition, setOptimisticTab]
  )

  return (
    <Tabs value={optimisticTab} onValueChange={handleTabChange}>
      <div className="border-b border-border px-1 pt-1">
        <TabsList className="w-full bg-transparent gap-1 h-auto p-0">
          <TabsTrigger
            value="single"
            className="flex-1 flex items-center justify-center gap-2 rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-cyan-accent data-[state=active]:bg-cyan-subtle data-[state=active]:text-cyan-accent px-4 py-2.5 text-sm font-medium transition-all"
          >
            <Mail className="h-4 w-4" />
            Single
          </TabsTrigger>
          <TabsTrigger
            value="bulk"
            className="flex-1 flex items-center justify-center gap-2 rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-cyan-accent data-[state=active]:bg-cyan-subtle data-[state=active]:text-cyan-accent px-4 py-2.5 text-sm font-medium transition-all"
          >
            <Users className="h-4 w-4" />
            Bulk
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="p-5 sm:p-6">
        <TabsContent value="single" className="mt-0">
          <SingleCheck />
        </TabsContent>
        <TabsContent value="bulk" className="mt-0">
          <BulkCheck />
        </TabsContent>
      </div>
    </Tabs>
  )
}
