<script setup lang="ts">
import {
  BellIcon,
  DatabaseIcon,
  LanguagesIcon,
  PaletteIcon,
  RocketIcon,
  SettingsIcon,
  UtensilsCrossedIcon,
  UsersIcon,
  WifiIcon,
} from '@lucide/vue'

const route = useRoute()

const tabIcons: Record<string, unknown> = {
  branding: PaletteIcon,
  pms: DatabaseIcon,
  wifi: WifiIcon,
  services: BellIcon,
  outlets: UtensilsCrossedIcon,
  routing: UsersIcon,
  languages: LanguagesIcon,
  publish: RocketIcon,
}

const currentIcon = computed(() => tabIcons[String(route.params.tab)] ?? SettingsIcon)
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <component :is="currentIcon" class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">Configuration Module</h3>
    <p class="max-w-sm text-[#86868B]">
      This section is currently being updated to support the latest PMS integrations.
    </p>
  </div>
</template>
