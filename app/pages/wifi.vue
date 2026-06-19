<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  WifiIcon,
  KeyIcon,
  TimerIcon,
  SaveIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
} from '@lucide/vue'
import { useAdminApi, type MasterSetup, type HotelSetup } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

useAuth()
const adminApi = useAdminApi()
const { can } = useAuthz()

const canWrite = computed(() => can('write', 'hotelSetup'))

const setups = ref<MasterSetup[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

// Local editable map: setupId -> value
const values = ref<Record<string, string>>({})
// Per-row saving + saved-confirmation state
const savingId = ref<string | null>(null)
const savedId = ref<string | null>(null)
const isSavingAll = ref(false)
// Per-password-field visibility toggle
const revealed = ref<Record<string, boolean>>({})

const WIFI_CODES = ['WIFI_SSID', 'WIFI_PASSWORD']

const wifiSetups = computed(() => setups.value.filter(s => WIFI_CODES.includes(s.setupCode)))
const operationsSetups = computed(() => setups.value.filter(s => !WIFI_CODES.includes(s.setupCode)))

function inputTypeFor(setup: MasterSetup): string {
  if (setup.inputType === 'time') return 'time'
  if (setup.inputType === 'number') return 'number'
  return 'text'
}

function isPassword(setup: MasterSetup): boolean {
  return setup.setupCode === 'WIFI_PASSWORD'
}

function resolvedType(setup: MasterSetup): string {
  if (isPassword(setup)) return revealed.value[setup.id] ? 'text' : 'password'
  return inputTypeFor(setup)
}

function toggleReveal(setup: MasterSetup) {
  revealed.value = { ...revealed.value, [setup.id]: !revealed.value[setup.id] }
}

async function load() {
  if (!can('read', 'hotelSetup')) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [masterSetups, hotelSetups] = await Promise.all([
      adminApi.listMasterSetups(),
      adminApi.listHotelSetups(),
    ])
    setups.value = masterSetups

    // Prefill from existing hotel setup values (match on setupId).
    const nextValues: Record<string, string> = {}
    for (const setup of masterSetups) {
      const existing = hotelSetups.find((h: HotelSetup) => h.setupId === setup.id)
      nextValues[setup.id] = existing ? existing.value : ''
    }
    values.value = nextValues
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isLoading.value = false
  }
}

async function saveOne(setup: MasterSetup) {
  if (!canWrite.value) return
  if (savingId.value) return
  savingId.value = setup.id
  savedId.value = null
  errorMessage.value = ''
  try {
    await adminApi.upsertHotelSetup({ setupId: setup.id, value: values.value[setup.id] ?? '' })
    savedId.value = setup.id
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    savingId.value = null
  }
}

async function saveAll() {
  if (!canWrite.value) return
  if (isSavingAll.value) return
  isSavingAll.value = true
  savedId.value = null
  errorMessage.value = ''
  try {
    for (const setup of setups.value) {
      await adminApi.upsertHotelSetup({ setupId: setup.id, value: values.value[setup.id] ?? '' })
    }
    savedId.value = 'all'
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSavingAll.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-[#1D1D1F]">WiFi &amp; Setup</h2>
        <p class="mt-1 text-sm text-[#86868B]">
          Guest network credentials and operational defaults for this hotel.
        </p>
      </div>
      <Button
        v-if="canWrite"
        size="sm"
        :disabled="isSavingAll || isLoading"
        @click="saveAll"
      >
        <SaveIcon class="h-4 w-4" />
        {{ isSavingAll ? 'Saving...' : 'Save all' }}
      </Button>
    </div>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <Alert v-if="savedId === 'all' && !errorMessage">
      <AlertTitle>Saved</AlertTitle>
      <AlertDescription>All setup values were saved successfully.</AlertDescription>
    </Alert>

    <!-- Guest WiFi -->
    <section v-if="wifiSetups.length" class="space-y-4">
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Guest WiFi</h3>

      <div class="grid gap-4 md:grid-cols-2">
        <Card v-for="setup in wifiSetups" :key="setup.id" class="rounded-xl">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <KeyIcon v-if="isPassword(setup)" class="h-4 w-4 text-[#027BFF]" />
              <WifiIcon v-else class="h-4 w-4 text-[#027BFF]" />
              {{ setup.name }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-2">
              <Label :for="`setup-${setup.id}`">{{ setup.name }}</Label>
              <div class="flex items-center gap-2">
                <Input
                  :id="`setup-${setup.id}`"
                  v-model="values[setup.id]"
                  :type="resolvedType(setup)"
                  :disabled="!canWrite"
                  :placeholder="setup.name"
                  class="flex-1"
                />
                <Button
                  v-if="isPassword(setup)"
                  type="button"
                  variant="outline"
                  size="icon"
                  :aria-label="revealed[setup.id] ? 'Hide value' : 'Show value'"
                  @click="toggleReveal(setup)"
                >
                  <EyeOffIcon v-if="revealed[setup.id]" class="h-4 w-4" />
                  <EyeIcon v-else class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter v-if="canWrite" class="justify-between">
            <span v-if="savedId === setup.id" class="flex items-center gap-1 text-xs text-[#34C759]">
              <CheckIcon class="h-3 w-3" />
              Saved
            </span>
            <span v-else />
            <Button
              size="sm"
              :disabled="savingId === setup.id"
              @click="saveOne(setup)"
            >
              <SaveIcon class="h-4 w-4" />
              {{ savingId === setup.id ? 'Saving...' : 'Save' }}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>

    <!-- Operations -->
    <section v-if="operationsSetups.length" class="space-y-4">
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Operations</h3>

      <div class="grid gap-4 md:grid-cols-2">
        <Card v-for="setup in operationsSetups" :key="setup.id" class="rounded-xl">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <TimerIcon class="h-4 w-4 text-[#027BFF]" />
              {{ setup.name }}
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-2">
              <Label :for="`setup-${setup.id}`">{{ setup.name }}</Label>
              <Input
                :id="`setup-${setup.id}`"
                v-model="values[setup.id]"
                :type="inputTypeFor(setup)"
                :disabled="!canWrite"
                :placeholder="setup.name"
              />
            </div>
          </CardContent>
          <CardFooter v-if="canWrite" class="justify-between">
            <span v-if="savedId === setup.id" class="flex items-center gap-1 text-xs text-[#34C759]">
              <CheckIcon class="h-3 w-3" />
              Saved
            </span>
            <span v-else />
            <Button
              size="sm"
              :disabled="savingId === setup.id"
              @click="saveOne(setup)"
            >
              <SaveIcon class="h-4 w-4" />
              {{ savingId === setup.id ? 'Saving...' : 'Save' }}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>

    <p
      v-if="!isLoading && !setups.length && !errorMessage"
      class="text-sm text-[#86868B]"
    >
      No setup fields are configured.
    </p>
  </div>
</template>
