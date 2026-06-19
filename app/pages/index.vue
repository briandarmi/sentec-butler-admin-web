<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  BellIcon,
  Building2Icon,
  GlobeIcon,
  HotelIcon,
  MailIcon,
  MapPinIcon,
  MapPinnedIcon,
  NetworkIcon,
  RefreshCwIcon,
  TimerIcon,
  UtensilsCrossedIcon,
} from '@lucide/vue'
import {
  useAdminApi,
  type Category,
  type CategoryItem,
  type Hotel,
  type HotelDepartment,
  type Organization,
  type RoomService,
  type Sla,
} from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const { isSuperAdmin } = useAuthz()
const auth = useAuth()

const hotel = ref<Hotel | null>(null)
const categories = ref<Category[]>([])
const items = ref<CategoryItem[]>([])
const services = ref<RoomService[]>([])
const slas = ref<Sla[]>([])
const hotelDepts = ref<HotelDepartment[]>([])
const hotels = ref<Hotel[]>([])
const orgs = ref<Organization[]>([])

const isLoading = ref(false)
const errorMessage = ref('')

const activeServiceCount = computed(() => services.value.filter(s => s.isActive).length)
const activeDeptCount = computed(() => hotelDepts.value.filter(d => d.isActive && !d.isRemoved).length)
const mappedItems = computed(() => items.value.filter(i => i.requestMapping))
const mappedCount = computed(() => mappedItems.value.length)
const unmappedCount = computed(() => items.value.length - mappedCount.value)
const coveragePercent = computed(() =>
  items.value.length === 0 ? 0 : Math.round((mappedCount.value / items.value.length) * 100),
)

const hotelInitial = computed(() => (hotel.value?.name ?? 'Hotel').slice(0, 1).toUpperCase())
const accountName = computed(() => auth.displayName.value || auth.username.value || 'there')

const stats = computed(() => [
  { label: 'Category Items', value: items.value.length, icon: UtensilsCrossedIcon },
  { label: 'Room Services', value: activeServiceCount.value, icon: BellIcon },
  { label: 'SLAs', value: slas.value.length, icon: TimerIcon },
  { label: 'Active Departments', value: activeDeptCount.value, icon: Building2Icon },
])

async function load() {
  if (isLoading.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    try {
      hotel.value = await adminApi.getCurrentHotel()
    }
    catch {
      hotel.value = null
    }

    const [cats, catItems, roomServices, slaList, depts] = await Promise.all([
      adminApi.listCategories(),
      adminApi.listCategoryItems(),
      adminApi.listRoomServices(),
      adminApi.listSlas(),
      adminApi.listHotelDepartments(),
    ])
    categories.value = cats
    items.value = catItems
    services.value = roomServices
    slas.value = slaList
    hotelDepts.value = depts

    if (isSuperAdmin.value) {
      const [hotelList, orgList] = await Promise.all([
        adminApi.listHotels(),
        adminApi.listOrganizations(),
      ])
      hotels.value = hotelList
      orgs.value = orgList
    }
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-8">
    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <!-- Hero row -->
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div class="flex items-center gap-4">
        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#027BFF] text-white shadow-sm">
          <Building2Icon class="h-7 w-7" />
        </div>
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-[#1D1D1F]">
            {{ hotel?.name ?? 'Your Hotel' }}
          </h2>
          <p class="text-sm font-medium text-[#86868B]">
            Welcome back, {{ accountName }} — here's your hotel at a glance.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>
        <Button size="sm" variant="outline" :disabled="isLoading" @click="load">
          <RefreshCwIcon class="h-4 w-4" :class="isLoading ? 'animate-spin' : ''" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.label" class="rounded-xl border-[#E5E5E7]">
        <CardContent class="flex flex-col gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F7] text-[#027BFF]">
            <component :is="stat.icon" class="h-4 w-4" />
          </div>
          <div>
            <p class="text-3xl font-bold tracking-tight text-[#1D1D1F]">{{ stat.value }}</p>
            <p class="text-xs font-semibold uppercase tracking-widest text-[#86868B]">{{ stat.label }}</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Hotel Profile + Routing coverage -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card class="rounded-xl border-[#E5E5E7]">
        <CardHeader>
          <CardTitle class="text-base">Hotel Profile</CardTitle>
          <CardDescription>Core identity and branding for the active hotel.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-3 text-sm">
            <div class="flex items-center gap-3">
              <HotelIcon class="h-4 w-4 shrink-0 text-[#86868B]" />
              <span class="font-medium text-[#1D1D1F]">{{ hotel?.name ?? '—' }}</span>
            </div>
            <div class="flex items-center gap-3">
              <MailIcon class="h-4 w-4 shrink-0 text-[#86868B]" />
              <span class="text-[#4A4A4F]">{{ hotel?.email ?? '—' }}</span>
            </div>
            <div class="flex items-center gap-3">
              <MapPinIcon class="h-4 w-4 shrink-0 text-[#86868B]" />
              <span class="text-[#4A4A4F]">{{ hotel?.address ?? '—' }}</span>
            </div>
            <div class="flex items-center gap-3">
              <GlobeIcon class="h-4 w-4 shrink-0 text-[#86868B]" />
              <span class="text-[#4A4A4F]">{{ hotel?.website ?? '—' }}</span>
            </div>
          </div>

          <Separator />

          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-[#86868B]">Brand Colors</p>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span
                  class="h-9 w-9 rounded-lg border border-[#E5E5E7] shadow-sm"
                  :style="{ backgroundColor: hotel?.primaryColor ?? '#F5F5F7' }"
                />
                <span class="text-xs font-medium text-[#86868B]">{{ hotel?.primaryColor ?? 'Primary' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="h-9 w-9 rounded-lg border border-[#E5E5E7] shadow-sm"
                  :style="{ backgroundColor: hotel?.secondaryColor ?? '#F5F5F7' }"
                />
                <span class="text-xs font-medium text-[#86868B]">{{ hotel?.secondaryColor ?? 'Secondary' }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-xl border-[#E5E5E7]">
        <CardHeader>
          <CardTitle class="text-base">Routing Coverage</CardTitle>
          <CardDescription>How many category items are mapped to a department &amp; SLA.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="flex items-end justify-between">
            <div>
              <p class="text-3xl font-bold tracking-tight text-[#1D1D1F]">{{ coveragePercent }}%</p>
              <p class="text-xs font-semibold uppercase tracking-widest text-[#86868B]">Mapped</p>
            </div>
            <div class="flex items-center gap-2 text-[#86868B]">
              <MapPinnedIcon class="h-5 w-5" />
            </div>
          </div>

          <Progress :model-value="coveragePercent" />

          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg bg-[#F5F5F7] p-3">
              <p class="text-xl font-bold text-[#1D1D1F]">{{ mappedCount }}</p>
              <div class="mt-1 flex items-center gap-2">
                <Badge variant="success">Mapped</Badge>
              </div>
            </div>
            <div class="rounded-lg bg-[#F5F5F7] p-3">
              <p class="text-xl font-bold text-[#1D1D1F]">{{ unmappedCount }}</p>
              <div class="mt-1 flex items-center gap-2">
                <Badge variant="secondary">Unmapped</Badge>
              </div>
            </div>
          </div>

          <p class="text-xs text-[#86868B]">
            {{ mappedCount }} of {{ items.length }} items have a routing mapping.
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Fleet (superadmin only) -->
    <div v-if="isSuperAdmin" class="space-y-4">
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Fleet</h3>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card class="rounded-xl border-[#E5E5E7]">
          <CardContent class="flex flex-col gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F7] text-[#027BFF]">
              <HotelIcon class="h-4 w-4" />
            </div>
            <div>
              <p class="text-3xl font-bold tracking-tight text-[#1D1D1F]">{{ hotels.length }}</p>
              <p class="text-xs font-semibold uppercase tracking-widest text-[#86868B]">Hotels</p>
            </div>
          </CardContent>
        </Card>
        <Card class="rounded-xl border-[#E5E5E7]">
          <CardContent class="flex flex-col gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F7] text-[#027BFF]">
              <NetworkIcon class="h-4 w-4" />
            </div>
            <div>
              <p class="text-3xl font-bold tracking-tight text-[#1D1D1F]">{{ orgs.length }}</p>
              <p class="text-xs font-semibold uppercase tracking-widest text-[#86868B]">Organizations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
