'use client'

import { useState } from 'react'
import { OneShot } from '@prdgenz/app'

/** Cloud-only wrapper: self-host has no Project table, so no project picker. */
export default function OneShotPage() {
  const [projectId, setProjectId] = useState('')
  return <OneShot projectId={projectId} onProjectIdChange={setProjectId} />
}
