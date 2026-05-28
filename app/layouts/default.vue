<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  ConciergeBellIcon,
  DatabaseIcon,
  LanguagesIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PaletteIcon,
  RocketIcon,
  SmartphoneIcon,
  UtensilsCrossedIcon,
  UsersIcon,
  WifiIcon,
  XIcon,
} from '@lucide/vue'
import { cn } from '~/lib/utils'

const route = useRoute()

const tabs = [
  { id: '', label: 'Dashboard', icon: LayoutDashboardIcon },
  { id: 'branding', label: 'Branding', icon: PaletteIcon },
  { id: 'pms', label: 'PMS Connection', icon: DatabaseIcon },
  { id: 'wifi', label: 'WiFi', icon: WifiIcon },
  { id: 'services', label: 'Services', icon: BellIcon },
  { id: 'outlets', label: 'Outlets', icon: UtensilsCrossedIcon },
  { id: 'routing', label: 'Staff Routing', icon: UsersIcon },
  { id: 'languages', label: 'Languages', icon: LanguagesIcon },
  { id: 'publish', label: 'Preview & Publish', icon: RocketIcon },
] as const

const isMobileMenuOpen = ref(false)

const activeTabId = computed(() => route.path.replace(/^\//, ''))

const activeTabMeta = computed(() => tabs.find((t) => t.id === activeTabId.value) ?? tabs[0])
const activeTabLabel = computed(() => activeTabMeta.value.label)
const headerDescription = computed(() => {
  if (activeTabId.value === '') {
    return 'Welcome back — here\'s your hotel at a glance.'
  }

  return `Configure your hotel's ${activeTabLabel.value.toLowerCase()} settings.`
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#F5F5F7] font-sans">
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
      @click="isMobileMenuOpen = false"
    />

    <aside
      :class="
        cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#E5E5E7] bg-[#F5F5F7] p-8 transition-transform duration-300 md:relative md:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        )
      "
    >
      <div class="mb-10 flex items-center justify-between px-2">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#027BFF] text-white">
            <ConciergeBellIcon/>
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight">Sentec Butler</h1>
            <p class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Administration</p>
          </div>
        </div>
        <div class="md:hidden">
          <Button variant="secondary" size="icon" @click="isMobileMenuOpen = false">
            <XIcon/>
          </Button>
        </div>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.id"
          :to="tab.id === '' ? '/' : `/${tab.id}`"
          :class="
            cn(
              'flex w-full items-center justify-between rounded-xl px-4 py-3 transition-all',
              activeTabId === tab.id
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:bg-white/50 hover:text-[#1D1D1F]',
            )
          "
          @click="isMobileMenuOpen = false"
        >
          <div class="flex items-center gap-3">
            <component :is="tab.icon" />
            <span class="text-sm font-medium">{{ tab.label }}</span>
          </div>
          <ChevronRightIcon v-if="activeTabId === tab.id" />
        </NuxtLink>
      </nav>

      <div class="border-t border-[#E5E5E7] pt-8">
        <Card class="border-none bg-[#027BFF] text-white shadow-lg">
          <CardHeader>
            <CardTitle class="text-xs uppercase tracking-widest text-white">Live Status</CardTitle>
            <CardDescription class="text-sm font-medium text-white/90">Your guest app is live at 4 hotels.</CardDescription>
            <CardAction>
              <div class="rounded-lg bg-white/10 p-2"><SmartphoneIcon /></div>
            </CardAction>
          </CardHeader>
          <CardFooter class="[&>button]:w-full">
            <Button variant="secondary" size="sm">
              View All Hotels
            </Button>
          </CardFooter>
        </Card>
      </div>
    </aside>

    <main class="w-full flex-1 overflow-y-auto p-4 md:p-8">
      <div class="mx-auto max-w-5xl">
        <header class="mb-8 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
          <div class="flex items-center gap-4">
            <div class="-ml-2 md:hidden">
              <Button variant="secondary" size="icon" @click="isMobileMenuOpen = true">
                <MenuIcon />
              </Button>
            </div>
            <div>
              <h2 class="mb-2 text-2xl font-bold tracking-tight capitalize md:text-3xl">{{ activeTabLabel }}</h2>
              <p class="text-sm font-medium text-[#86868B] md:text-base">
                {{ headerDescription }}
              </p>
            </div>
          </div>

          <div class="grid w-full grid-cols-2 gap-3 md:flex md:w-auto">
            <Button variant="secondary">
              Discard
            </Button>
            <Button>
              <CheckIcon />
              Publish
            </Button>
          </div>
        </header>

        <NuxtPage />
      </div>
    </main>
  </div>
</template>
