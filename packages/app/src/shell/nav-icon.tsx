import { Icon } from '@prdgenz/ui'
export function NavIcon({href}:{href:string}){return <Icon name={href.includes('/new')?'plus':href.includes('/settings')?'settings':'document'} />}
