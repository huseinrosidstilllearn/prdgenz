'use client'

import { useState } from 'react'
import { Wizard } from '@prdgenz/app'

/**
 * Cloud-only wrapper: self-host has no Project table, so the project picker is
 * the single thing that differs from the shared wizard.
 */
export default function WizardPage() {
  const [projectId, setProjectId] = useState('')
  return <Wizard projectId={projectId} onProjectIdChange={setProjectId} />
}
