'use client'

import { ActivityTimeline } from './activity-timeline'

interface ActivityTimelineWrapperProps {
  investorId: string
}

export function ActivityTimelineWrapper({ investorId }: ActivityTimelineWrapperProps) {
  return <ActivityTimeline investorId={investorId} />
}
