import type { Config } from 'tailwindcss'
import { preset } from '@prdgenz/ui/tailwind-preset'

const config: Config = {
  presets: [preset as unknown as Config],
  content: ['./src/**/*.{ts,tsx}', '../../packages/app/src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
}

export default config

