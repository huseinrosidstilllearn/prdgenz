import { RouteNotFound } from '@prdgenz/app'

export default function NotFound() {
  return <RouteNotFound backHref="/dashboard" backLabel="Back to dashboard" />
}
