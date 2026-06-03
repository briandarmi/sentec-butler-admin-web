<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { MapPinnedIcon, ShieldAlertIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const auth = useAuth()
const isSuperAdmin = computed(() => auth.role.value === 'superadmin')

const hotels = ref<Awaited<ReturnType<typeof adminApi.listSuperadminHotels>>>([])
const categoryItems = ref<Awaited<ReturnType<typeof adminApi.listCategoryItems>>>([])
const isLoading = ref(false)

const mappedCount = computed(() => categoryItems.value.filter((item) => item.requestMapping).length)
const unmappedCount = computed(() => Math.max(categoryItems.value.length - mappedCount.value, 0))

async function loadData() {
  if (!isSuperAdmin.value) {
    return
  }

  isLoading.value = true
  try {
    const [hotelRows, itemRows] = await Promise.all([
      adminApi.listSuperadminHotels(),
      adminApi.listCategoryItems(),
    ])

    hotels.value = hotelRows
    categoryItems.value = itemRows
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
      Staff routing management is available only to superadmin users.
    </p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-center gap-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F5F7]">
        <MapPinnedIcon />
      </div>
      <div>
        <h3 class="text-lg font-bold">Routing Coverage</h3>
        <p class="text-sm text-[#86868B]">Request mapping status for selected hotel and full fleet context</p>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader class="gap-0 pb-0">
          <CardDescription class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Total Routing Items</CardDescription>
        </CardHeader>
        <CardContent>
          <CardTitle class="text-3xl tracking-tight">{{ categoryItems.length }}</CardTitle>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="gap-0 pb-0">
          <CardDescription class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Mapped Items</CardDescription>
        </CardHeader>
        <CardContent>
          <CardTitle class="text-3xl tracking-tight">{{ mappedCount }}</CardTitle>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="gap-0 pb-0">
          <CardDescription class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">Unmapped Items</CardDescription>
        </CardHeader>
        <CardContent>
          <CardTitle class="text-3xl tracking-tight">{{ unmappedCount }}</CardTitle>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Current Hotel Routing Matrix</CardTitle>
        <CardDescription>Items without mapping should be assigned in category item setup.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <div
          v-for="item in categoryItems"
          :key="item.id"
          class="flex items-center justify-between rounded-xl border border-[#E5E5E7] bg-white px-4 py-3"
        >
          <div>
            <p class="text-sm font-semibold">{{ item.name }}</p>
            <p class="text-xs text-[#86868B]">Category #{{ item.categoryId }}</p>
          </div>
          <Badge :variant="item.requestMapping ? 'success' : 'secondary'">
            {{ item.requestMapping ? 'Mapped' : 'Unmapped' }}
          </Badge>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Fleet Scope</CardTitle>
        <CardDescription>Hotels currently available for superadmin management</CardDescription>
      </CardHeader>
      <CardContent class="space-y-2">
        <div v-for="hotel in hotels" :key="hotel.id" class="flex items-center justify-between rounded-xl border border-[#E5E5E7] bg-white px-4 py-3">
          <p class="text-sm font-semibold">{{ hotel.name }}</p>
          <Badge :variant="hotel.isActive ? 'success' : 'secondary'">{{ hotel.isActive ? 'Active' : 'Inactive' }}</Badge>
        </div>
      </CardContent>
    </Card>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading routing data...</p>
  </div>
</template>
