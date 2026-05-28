import { ref } from 'vue'

export type Language = 'en' | 'id' | 'zh'

export interface HotelConfig {
  hotelName: string
  logoUrl: string
  primaryColor: string
  accentColor: string
  wifiSsid: string
  wifiPassword: string
  language: Language
  unreadChat: number
  fontFamily: string
}

export interface ServiceItem {
  id: number
  name: string
  category: string
  active: boolean
}

export interface OutletItem {
  id: number
  name: string
  type: string
  status: string
}

const config = ref<HotelConfig>({
  hotelName: 'The Grand Sentec',
  logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=GS&backgroundColor=1d1d1f',
  primaryColor: '#027BFF',
  accentColor: '#FF1493',
  wifiSsid: 'Sentec_Guest_HighSpeed',
  wifiPassword: 'luxury-stay-2024',
  language: 'en',
  unreadChat: 1,
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
})

const services = ref<ServiceItem[]>([
  { id: 1, name: 'Extra Towels', category: 'Housekeeping', active: true },
  { id: 2, name: 'Extra Pillows', category: 'Housekeeping', active: true },
  { id: 3, name: 'Room Cleaning', category: 'Housekeeping', active: true },
  { id: 4, name: 'AC Maintenance', category: 'Maintenance', active: true },
  { id: 5, name: 'Wake-up Call', category: 'Concierge', active: true },
])

const outlets: OutletItem[] = [
  { id: 1, name: 'Room Service', type: 'Dining', status: 'Open' },
  { id: 2, name: 'The Azure Grill', type: 'Dining', status: 'Open' },
  { id: 3, name: 'Serenity Spa', type: 'Wellness', status: 'Open' },
  { id: 4, name: 'Laundry & Press', type: 'Service', status: 'Open' },
]

function updateConfig(newConfig: Partial<HotelConfig>) {
  config.value = { ...config.value, ...newConfig }
}

function toggleService(serviceId: number) {
  services.value = services.value.map((service) =>
    service.id === serviceId ? { ...service, active: !service.active } : service,
  )
}

export function useAdminConfig() {
  return { config, updateConfig, services, toggleService, outlets }
}
