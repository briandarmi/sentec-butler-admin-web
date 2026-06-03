<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAdminApi } from '~/composables/useAdminApi'

const adminApi = useAdminApi()

const applications = ref<Awaited<ReturnType<typeof adminApi.listApplications>>>([])
const hotelSyncs = ref<Awaited<ReturnType<typeof adminApi.listHotelSyncs>>>([])

const pmsProvider = ref('')
const useAsymetric = ref(false)
const privateKey = ref('')
const isLoading = ref(false)
const isSaving = ref(false)
const currentSyncId = ref<string | undefined>(undefined)

const providerOptions = computed(() => applications.value.map((app) => ({ label: app.name, value: app.id })))

const syncItems = computed(() => {
  const total = hotelSyncs.value.length
  const connected = hotelSyncs.value.filter((item) => !item.useAsymetric).length
  const secure = hotelSyncs.value.filter((item) => item.useAsymetric).length

  return [
    { label: 'Applications Linked', count: String(total), status: 'Synced' },
    { label: 'Symmetric Mode', count: String(connected), status: 'Synced' },
    { label: 'Asymmetric Mode', count: String(secure), status: secure > 0 ? 'Syncing...' : 'Synced' },
  ]
})

function hydrateFromSync(applicationId: string) {
  const found = hotelSyncs.value.find((sync) => sync.applicationId === applicationId)
  currentSyncId.value = found?.id
  useAsymetric.value = found?.useAsymetric ?? false
  privateKey.value = found?.privateKey ?? ''
}

async function loadPmsSync() {
  isLoading.value = true
  try {
    const [appRows, syncRows] = await Promise.all([adminApi.listApplications(), adminApi.listHotelSyncs()])
    applications.value = appRows
    hotelSyncs.value = syncRows

    const firstApp = appRows[0]
    if (!pmsProvider.value && firstApp) {
      pmsProvider.value = firstApp.id
    }

    if (pmsProvider.value) {
      hydrateFromSync(pmsProvider.value)
    }
  }
  finally {
    isLoading.value = false
  }
}

async function savePmsSync() {
  if (!pmsProvider.value || isSaving.value) {
    return
  }

  isSaving.value = true
  try {
    await adminApi.upsertHotelSync({
      id: currentSyncId.value,
      applicationId: pmsProvider.value,
      useAsymetric: useAsymetric.value,
      privateKey: useAsymetric.value ? privateKey.value : '',
    })

    await loadPmsSync()
  }
  finally {
    isSaving.value = false
  }
}

watch(pmsProvider, (value) => {
  if (value) {
    hydrateFromSync(value)
  }
})

onMounted(loadPmsSync)
</script>

<template>
  <div class="max-w-2xl space-y-8">
    <section>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Connection Settings</h3>
      <Card>
        <CardContent>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="md:col-span-2">
            <div class="space-y-2">
              <Label>PMS Provider</Label>
              <Select v-model="pmsProvider">
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="provider in providerOptions" :key="provider.value" :value="provider.value">{{ provider.label }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label>Hotel ID</Label>
            <Input
              type="text"
              :model-value="adminApi.hotelId.value"
              disabled
            />
          </div>
          <div class="space-y-2">
            <Label>Private Key</Label>
            <Input
              type="password"
              v-model="privateKey"
            />
          </div>
          <div class="md:col-span-2 flex items-center justify-between rounded-xl border border-[#E5E5E7] bg-[#F5F5F7] p-3">
            <p class="text-sm">Use Asymmetric Key Mode</p>
            <Switch v-model:checked="useAsymetric" />
          </div>
          </div>
        </CardContent>

        <CardFooter class="flex flex-col items-center justify-between gap-4 border-t border-[#E5E5E7] sm:flex-row">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full" :class="hotelSyncs.length ? 'bg-success' : 'bg-[#86868B]'" />
            <span class="text-sm font-bold" :class="hotelSyncs.length ? 'text-success' : 'text-[#86868B]'">
              {{ hotelSyncs.length ? 'Connected & Synced' : 'No Active Sync' }}
            </span>
          </div>
          <div class="w-full sm:w-auto">
            <Button size="sm" :disabled="isLoading || isSaving" @click="savePmsSync">
              {{ isLoading ? 'Loading...' : isSaving ? 'Saving...' : 'Save Connection' }}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </section>

    <section>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Sync Status</h3>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card v-for="item in syncItems" :key="item.label">
          <CardHeader class="gap-0 pb-0">
            <CardDescription class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">{{ item.label }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <p class="text-xl font-bold">{{ item.count }}</p>
            <Badge :variant="item.status === 'Synced' ? 'success' : 'secondary'">{{ item.status }}</Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>
