<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  NetworkIcon,
  ShieldAlertIcon,
  LinkIcon,
  KeyIcon,
  SaveIcon,
  RefreshCwIcon,
} from '@lucide/vue'
import { useAdminApi, type Application, type HotelSync } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const { can } = useAuthz()
useAuth()

const RESOURCE = 'hotelSync' as const

const applications = ref<Application[]>([])
const syncs = ref<HotelSync[]>([])

const isLoading = ref(false)
const isSaving = ref(false)
const isFormDialogOpen = ref(false)
const errorMessage = ref('')

const editId = ref<string | undefined>(undefined)
const formApplicationId = ref('')
const formSyncId = ref('1')
const formUseAsymetric = ref(false)
const formPrivateKey = ref('')
const formSecretKey = ref('')

function syncForApplication(applicationId: string): HotelSync | undefined {
  return syncs.value.find(s => s.applicationId === applicationId)
}

const applicationName = computed(() => {
  return (applicationId: string) =>
    applications.value.find(a => a.id === applicationId)?.name ?? 'Unknown application'
})

async function load() {
  errorMessage.value = ''
  if (!can('read', RESOURCE)) return
  isLoading.value = true
  try {
    const [apps, syncRows] = await Promise.all([
      adminApi.listApplications(),
      adminApi.listHotelSyncs(),
    ])
    applications.value = apps
    syncs.value = syncRows
  }
  finally {
    isLoading.value = false
  }
}

function resetForm() {
  editId.value = undefined
  formApplicationId.value = applications.value[0]?.id ?? ''
  formSyncId.value = '1'
  formUseAsymetric.value = false
  formPrivateKey.value = ''
  formSecretKey.value = ''
  errorMessage.value = ''
}

function openConfigure(applicationId: string) {
  resetForm()
  formApplicationId.value = applicationId
  const existing = syncForApplication(applicationId)
  if (existing) {
    editId.value = existing.id
    formSyncId.value = existing.syncId || '1'
    formUseAsymetric.value = existing.useAsymetric
    formPrivateKey.value = existing.privateKey ?? ''
    formSecretKey.value = existing.secretKey ?? ''
  }
  isFormDialogOpen.value = true
}

async function save() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertHotelSync({
      id: editId.value,
      applicationId: formApplicationId.value,
      syncId: formSyncId.value,
      useAsymetric: formUseAsymetric.value,
      privateKey: formUseAsymetric.value ? formPrivateKey.value : null,
      secretKey: formUseAsymetric.value ? null : formSecretKey.value,
    })
    await load()
    isFormDialogOpen.value = false
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSaving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div
    v-if="!can('read', RESOURCE)"
    class="flex flex-col items-center justify-center py-20 text-center"
  >
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <ShieldAlertIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">Superadmin Access Only</h3>
    <p class="max-w-sm text-[#86868B]">This section is available only to superadmin users.</p>
  </div>

  <div v-else class="space-y-8">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">PMS / EMS Sync</h3>
        <p class="max-w-2xl text-sm text-[#86868B]">
          Connect this hotel's Sentec PMS and EMS applications to Sentec Butler. Each application
          can sync via a symmetric secret key or an asymmetric key pair.
        </p>
      </div>
      <Button size="sm" variant="outline" :disabled="isLoading" @click="load">
        <RefreshCwIcon class="h-4 w-4" />
        Refresh
      </Button>
    </div>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <!-- Sync status cards -->
    <div v-if="!isLoading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="app in applications"
        :key="app.id"
        class="rounded-xl border-[#E5E5E7]"
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2">
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F7]">
                <NetworkIcon class="h-4 w-4 text-[#1D1D1F]" />
              </div>
              <CardTitle class="text-base text-[#1D1D1F]">{{ app.name }}</CardTitle>
            </div>
            <Badge :variant="syncForApplication(app.id) ? 'success' : 'secondary'">
              {{ syncForApplication(app.id) ? 'Connected' : 'Not connected' }}
            </Badge>
          </div>
        </CardHeader>

        <CardContent class="space-y-3">
          <div class="flex items-center justify-between text-sm">
            <span class="text-[#86868B]">Mode</span>
            <span class="font-medium text-[#1D1D1F]">
              {{ syncForApplication(app.id)?.useAsymetric ? 'Asymmetric' : 'Symmetric' }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-[#86868B]">Sync ID</span>
            <span class="font-medium text-[#1D1D1F]">
              {{ syncForApplication(app.id)?.syncId ?? '—' }}
            </span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            v-if="can('write', RESOURCE)"
            size="sm"
            variant="outline"
            class="w-full"
            @click="openConfigure(app.id)"
          >
            <LinkIcon class="h-4 w-4" />
            Configure
          </Button>
        </CardFooter>
      </Card>
    </div>

    <p v-if="!isLoading && applications.length === 0" class="text-sm text-[#86868B]">
      No applications available.
    </p>

    <!-- PMS integration note (doc §9) -->
    <Separator class="bg-[#E5E5E7]" />
    <div class="rounded-xl bg-[#F5F5F7] p-4 text-sm text-[#86868B]">
      <p class="mb-2 font-semibold text-[#1D1D1F]">PMS integration events</p>
      <p>
        The PMS exchanges three events with Butler. <span class="font-medium text-[#1D1D1F]">Check-in</span>
        sends guest data to Butler, which returns an activation link and QR code.
        <span class="font-medium text-[#1D1D1F]">Checkout</span> notifies Butler to expire the guest
        session. The <span class="font-medium text-[#1D1D1F]">validation</span> endpoint lets Butler
        confirm whether a guest is still staying.
      </p>
    </div>

    <!-- Configure dialog -->
    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ editId ? 'Update sync configuration' : 'Configure sync' }}</DialogTitle>
          <DialogDescription>
            Set how this application authenticates when syncing with Sentec Butler.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-5 py-2">
          <Alert v-if="errorMessage" variant="destructive">
            <AlertTitle>Unable to save</AlertTitle>
            <AlertDescription>{{ errorMessage }}</AlertDescription>
          </Alert>

          <div class="space-y-2">
            <Label for="applicationId">Application</Label>
            <Select v-model="formApplicationId">
              <SelectTrigger id="applicationId">
                <SelectValue placeholder="Select application" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="app in applications" :key="app.id" :value="app.id">
                  {{ app.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="syncId">Sync ID</Label>
            <Input id="syncId" v-model="formSyncId" placeholder="1" />
          </div>

          <div class="flex items-center justify-between rounded-lg border border-[#E5E5E7] p-3">
            <div class="space-y-0.5">
              <Label for="useAsymetric">Use asymmetric keys</Label>
              <p class="text-xs text-[#86868B]">
                Authenticate with a private key instead of a shared secret.
              </p>
            </div>
            <Switch id="useAsymetric" v-model:checked="formUseAsymetric" />
          </div>

          <div v-if="formUseAsymetric" class="space-y-2">
            <Label for="privateKey">
              <KeyIcon class="mr-1 inline h-3.5 w-3.5" />Private key
            </Label>
            <Textarea
              id="privateKey"
              v-model="formPrivateKey"
              placeholder="Paste the application's private key"
              class="font-mono text-xs"
            />
          </div>

          <div v-else class="space-y-2">
            <Label for="secretKey">
              <KeyIcon class="mr-1 inline h-3.5 w-3.5" />Secret key
            </Label>
            <Input
              id="secretKey"
              :model-value="formSecretKey ? '••••••••••••••••' : ''"
              type="text"
              readonly
              placeholder="Auto-generated on save"
              class="font-mono"
            />
            <p class="text-xs text-[#86868B]">
              The secret key is auto-generated by Butler and shared with the application.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="isFormDialogOpen = false">
            Cancel
          </Button>
          <Button :disabled="isSaving || !formApplicationId" @click="save">
            <SaveIcon class="h-4 w-4" />
            {{ isSaving ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
