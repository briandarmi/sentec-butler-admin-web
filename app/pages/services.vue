<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  LinkIcon,
  UtensilsCrossedIcon,
} from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const { can } = useAuthz()
useAuth()

const services = ref<Awaited<ReturnType<typeof adminApi.listRoomServices>>>([])
const icons = ref<Awaited<ReturnType<typeof adminApi.listIcons>>>([])

const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref<string>('')

const isFormDialogOpen = ref(false)
const editId = ref<string | undefined>(undefined)

const formName = ref('')
const formIconId = ref<string>('')
const formDescription = ref('')
const formHyperlink = ref('')
const formActive = ref(true)

const canWrite = computed(() => can('write', 'roomServices'))
const dialogTitle = computed(() => (editId.value ? 'Edit Service' : 'New Service'))

async function load() {
  if (!can('read', 'roomServices')) return
  isLoading.value = true
  try {
    const [svc, ico] = await Promise.all([
      adminApi.listRoomServices(),
      adminApi.listIcons(),
    ])
    services.value = svc
    icons.value = ico
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  editId.value = undefined
  formName.value = ''
  formIconId.value = ''
  formDescription.value = ''
  formHyperlink.value = ''
  formActive.value = true
  errorMessage.value = ''
}

function openCreateDialog() {
  resetForm()
  isFormDialogOpen.value = true
}

function startEdit(row: RoomServiceRow) {
  errorMessage.value = ''
  editId.value = row.id
  formName.value = row.name
  formIconId.value = row.iconId ?? ''
  formDescription.value = row.description ?? ''
  formHyperlink.value = row.hyperlink ?? ''
  formActive.value = row.isActive
  isFormDialogOpen.value = true
}

type RoomServiceRow = Awaited<ReturnType<typeof adminApi.listRoomServices>>[number]

async function save() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertRoomService({
      id: editId.value,
      iconId: formIconId.value || undefined,
      name: formName.value,
      description: formDescription.value || null,
      hyperlink: formHyperlink.value || null,
      isActive: formActive.value,
    })
    await load()
    isFormDialogOpen.value = false
  } catch (e) {
    errorMessage.value = String((e as Error).message)
  } finally {
    isSaving.value = false
  }
}

async function toggleActive(row: RoomServiceRow) {
  errorMessage.value = ''
  try {
    await adminApi.upsertRoomService({
      id: row.id,
      iconId: row.iconId || undefined,
      name: row.name,
      description: row.description,
      hyperlink: row.hyperlink,
      isActive: !row.isActive,
    })
    await load()
  } catch (e) {
    errorMessage.value = String((e as Error).message)
  }
}

async function remove(row: RoomServiceRow) {
  errorMessage.value = ''
  try {
    await adminApi.deleteRoomService(row.id)
    await load()
  } catch (e) {
    errorMessage.value = String((e as Error).message)
  }
}

onMounted(load)
</script>

<template>
  <div v-if="!can('read', 'roomServices')" class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <UtensilsCrossedIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">No Access</h3>
    <p class="max-w-sm text-[#86868B]">You do not have permission to view room services.</p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-end justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Room Services</h3>
        <p class="text-sm text-[#86868B]">In-room services and amenities available to guests.</p>
      </div>
      <Button v-if="canWrite" size="sm" @click="openCreateDialog">
        <PlusIcon />
        New Service
      </Button>
    </div>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <div v-else-if="services.length === 0" class="rounded-xl border border-[#E5E5E7] bg-white py-16 text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F7]">
        <UtensilsCrossedIcon class="text-[#C7C7CC]" />
      </div>
      <p class="text-sm font-medium text-[#1D1D1F]">No room services yet</p>
      <p class="mt-1 text-sm text-[#86868B]">Create your first service to get started.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card v-for="service in services" :key="service.id" class="rounded-xl">
        <CardContent>
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F5F7] text-2xl">
              {{ service.icon?.icon || '🛎️' }}
            </div>

            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <p class="truncate font-semibold text-[#1D1D1F]">{{ service.name }}</p>
                <Badge v-if="service.hyperlink" variant="outline" class="gap-1">
                  <LinkIcon class="h-3 w-3" />
                  Link
                </Badge>
              </div>
              <p class="line-clamp-2 text-sm text-[#86868B]">
                {{ service.description || 'No description.' }}
              </p>
            </div>

            <Switch
              :checked="service.isActive"
              :disabled="!canWrite"
              @update:checked="() => toggleActive(service)"
            />
          </div>

          <div v-if="canWrite" class="mt-4 flex items-center gap-2 border-t border-[#E5E5E7] pt-4">
            <Button size="sm" variant="outline" @click="startEdit(service)">
              <PencilIcon />
              Edit
            </Button>
            <Button size="sm" variant="outline" class="text-[#FF3B30]" @click="remove(service)">
              <Trash2Icon />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ dialogTitle }}</DialogTitle>
          <DialogDescription>Configure the room service shown to guests.</DialogDescription>
        </DialogHeader>

        <Alert v-if="errorMessage" variant="destructive">
          <AlertTitle>Unable to save</AlertTitle>
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label for="svc-name">Name</Label>
            <Input id="svc-name" v-model="formName" placeholder="Room Service" />
          </div>

          <div class="space-y-2">
            <Label>Icon</Label>
            <Select v-model="formIconId">
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="ico in icons" :key="ico.id" :value="ico.id">
                  {{ ico.icon }} {{ ico.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="svc-desc">Description</Label>
            <Textarea id="svc-desc" v-model="formDescription" placeholder="Short description shown to guests" />
          </div>

          <div class="space-y-2">
            <Label for="svc-link">Hyperlink</Label>
            <Input id="svc-link" v-model="formHyperlink" placeholder="https://..." />
          </div>

          <div class="flex items-center justify-between rounded-xl border border-[#E5E5E7] px-4 py-3">
            <div class="space-y-0.5">
              <Label>Active</Label>
              <p class="text-xs text-[#86868B]">Visible to guests when enabled.</p>
            </div>
            <Switch v-model:checked="formActive" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="isFormDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving || !formName" @click="save">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
