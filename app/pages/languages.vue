<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { GlobeIcon, ShieldAlertIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const auth = useAuth()
const isSuperAdmin = computed(() => auth.role.value === 'superadmin')

const hotels = ref<Awaited<ReturnType<typeof adminApi.listSuperadminHotels>>>([])
const isLoading = ref(false)

const languageMap: Record<string, string> = {
  '1': 'Indonesian',
  '2': 'English',
  '3': 'Chinese',
}

const selectedHotel = computed(() => hotels.value.find((hotel) => hotel.id === adminApi.hotelId.value))

const distribution = computed(() => {
  const map = new Map<string, number>()

  for (const hotel of hotels.value) {
    const key = languageMap[hotel.languageId] ?? `Language ${hotel.languageId}`
    map.set(key, (map.get(key) ?? 0) + 1)
  }

  return Array.from(map.entries()).map(([name, count]) => ({ name, count }))
})

async function loadData() {
  if (!isSuperAdmin.value) {
    return
  }

  isLoading.value = true
  try {
    hotels.value = await adminApi.listSuperadminHotels()
  }
  finally {
    isLoading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div v-if="!isSuperAdmin" class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <ShieldAlertIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">Superadmin Access Only</h3>
    <p class="max-w-sm text-[#86868B]">
      Fleet language analytics is available only to superadmin users.
    </p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F5F7]">
        <GlobeIcon />
      </div>
      <div>
        <h3 class="text-lg font-bold">Language Management</h3>
        <p class="text-sm text-[#86868B]">Current language setup by hotel across superadmin scope</p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Selected Hotel Language</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-[#86868B]">Hotel</p>
        <p class="text-lg font-semibold">{{ selectedHotel?.name ?? '-' }}</p>
        <p class="mt-3 text-sm text-[#86868B]">Language</p>
        <p class="text-lg font-semibold">{{ selectedHotel ? (languageMap[selectedHotel.languageId] ?? `Language ${selectedHotel.languageId}`) : '-' }}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Fleet Distribution</CardTitle>
        <CardDescription>Grouped by current language id mapping in fake API</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <div v-for="row in distribution" :key="row.name" class="flex items-center justify-between rounded-xl border border-[#E5E5E7] bg-white px-4 py-3">
          <p class="text-sm font-semibold">{{ row.name }}</p>
          <Badge variant="secondary">{{ row.count }} hotel(s)</Badge>
        </div>
      </CardContent>
    </Card>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading language data...</p>
  </div>
</template>
