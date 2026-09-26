'use client'

import { Wizard } from '@prdgenz/app'

/**
 * Self-host uses the shared wizard as-is: there is no Project table, so no
 * project picker is passed and the flow matches cloud apart from that field.
 */
export default function WizardPage() {
  return <Wizard />
}
