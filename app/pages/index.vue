<script setup lang="ts">
import {
  BellIcon,
  Building2Icon,
  DatabaseIcon,
  PaletteIcon,
  UtensilsCrossedIcon,
  UsersIcon,
  WifiIcon,
} from '@lucide/vue'

const quickLinks = [
  { id: 'branding', label: 'Branding', icon: PaletteIcon, description: 'Logo, colors & fonts' },
  { id: 'pms', label: 'PMS Connection', icon: DatabaseIcon, description: 'Opera, Mews, Cloudbeds' },
  { id: 'wifi', label: 'WiFi', icon: WifiIcon, description: 'SSID & password' },
  { id: 'services', label: 'Services', icon: BellIcon, description: 'Housekeeping & concierge' },
  { id: 'outlets', label: 'Outlets', icon: UtensilsCrossedIcon, description: 'Dining & wellness' },
  { id: 'routing', label: 'Staff Routing', icon: UsersIcon, description: 'Assign request routes' },
]

const stats = [
  { label: 'Active Hotels', value: '4' },
  { label: 'Guest Requests Today', value: '128' },
  { label: 'Services Enabled', value: '5' },
  { label: 'Outlets Listed', value: '4' },
]
</script>

<template>
  <div class="space-y-10">
    <div class="flex items-center gap-4">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#027BFF] text-white shadow-md">
        <Building2Icon />
      </div>
      <div>
        <h2 class="text-2xl font-bold tracking-tight">The Grand Sentec</h2>
        <p class="text-sm text-[#86868B]">Admin overview — all systems operational</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.label" class="gap-4">
        <CardHeader class="gap-0 pb-0">
          <CardDescription class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">{{ stat.label }}</CardDescription>
        </CardHeader>
        <CardContent class="mt-auto">
          <CardTitle class="text-3xl tracking-tight">{{ stat.value }}</CardTitle>
        </CardContent>
      </Card>
    </div>

    <div>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Configuration</h3>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="link in quickLinks"
          :key="link.id"
          class="transition-shadow hover:shadow-md"
        >
          <CardContent>
            <NuxtLink
              :to="`/${link.id}`"
              class="group flex items-center gap-4"
            >
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F5F7] transition-colors group-hover:bg-[#027BFF]/10">
                <component :is="link.icon" class="text-[#86868B] transition-colors group-hover:text-[#027BFF]" />
              </div>
              <div>
                <p class="text-sm font-semibold">{{ link.label }}</p>
                <p class="text-xs text-[#86868B]">{{ link.description }}</p>
              </div>
            </NuxtLink>
          </CardContent>
        </Card>
      </div>
    </div>

    <div>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">PMS Sync Status</h3>
      <Card>
        <CardContent class="space-y-0">
          <div
            v-for="item in [
              { label: 'Guest Profiles', count: '1,240', status: 'Synced' },
              { label: 'Room Inventory', count: '250', status: 'Synced' },
              { label: 'Reservations', count: '48', status: 'Syncing...' },
            ]"
            :key="item.label"
            class="flex items-center justify-between border-b border-[#F5F5F7] py-4 first:pt-0 last:border-b-0 last:pb-0"
          >
            <div>
              <p class="text-sm font-medium">{{ item.label }}</p>
              <p class="text-xs text-[#86868B]">{{ item.count }} records</p>
            </div>
            <Badge :variant="item.status === 'Synced' ? 'success' : 'secondary'">
              {{ item.status }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
