<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BellIcon, PlusIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'

const adminApi = useAdminApi()

const services = ref<Awaited<ReturnType<typeof adminApi.listRoomServices>>>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isFormDialogOpen = ref(false)

const editId = ref<string | undefined>(undefined)
const formName = ref('')
const formDescription = ref('')
const formHyperlink = ref('')
const formActive = ref(true)

async function loadServices() {
  isLoading.value = true
  try {
    services.value = await adminApi.listRoomServices()
  }
  finally {
    isLoading.value = false
  }
}

function resetForm() {
  editId.value = undefined
  formName.value = ''
  formDescription.value = ''
  formHyperlink.value = ''
  formActive.value = true
}

function openCreateDialog() {
  resetForm()
  isFormDialogOpen.value = true
}

function startEdit(service: (typeof services.value)[number]) {
  editId.value = service.id
  formName.value = service.name
  formDescription.value = service.description ?? ''
  formHyperlink.value = service.hyperlink ?? ''
  formActive.value = service.isActive
  isFormDialogOpen.value = true
}

async function saveService() {
  if (!formName.value.trim() || isSaving.value) {
    return
  }

  isSaving.value = true
  try {
    await adminApi.upsertRoomService({
      id: editId.value,
      name: formName.value,
      description: formDescription.value,
      hyperlink: formHyperlink.value,
      isActive: formActive.value,
    })

    await loadServices()
    resetForm()
    isFormDialogOpen.value = false
  }
  finally {
    isSaving.value = false
  }
}

async function toggleService(service: (typeof services.value)[number]) {
  await adminApi.upsertRoomService({
    id: service.id,
    name: service.name,
    description: service.description ?? '',
    hyperlink: service.hyperlink ?? '',
    isActive: !service.isActive,
  })

  await loadServices()
}

async function removeService(id: string) {
  await adminApi.deleteRoomService(id)
  await loadServices()
}

onMounted(loadServices)
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Active Services</h3>
      <Button size="sm" @click="openCreateDialog">
        <PlusIcon />
        New Service
      </Button>
    </div>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ editId ? 'Edit Service' : 'Create Service' }}</DialogTitle>
          <DialogDescription>Configure room service details for guests.</DialogDescription>
        </DialogHeader>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label>Name</Label>
            <Input v-model="formName" type="text" placeholder="Service name" />
          </div>
          <div class="space-y-2">
            <Label>Link</Label>
            <Input v-model="formHyperlink" type="text" placeholder="https://..." />
          </div>
          <div class="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea v-model="formDescription" placeholder="Describe this service" />
          </div>
          <div class="md:col-span-2 flex items-center justify-between rounded-xl border border-[#E5E5E7] bg-[#F5F5F7] p-3">
            <p class="text-sm">Active</p>
            <Switch v-model:checked="formActive" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" @click="isFormDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving" @click="saveService">{{ isSaving ? 'Saving...' : editId ? 'Update Service' : 'Create Service' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card
        v-for="service in services"
        :key="service.id"
      >
        <CardContent class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-[#F5F5F7] p-2">
              <BellIcon />
            </div>
            <div>
              <h4 class="text-sm font-semibold">{{ service.name }}</h4>
              <p class="text-[10px] uppercase tracking-wider text-[#86868B]">Room Service</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Switch :checked="service.isActive" @update:checked="() => toggleService(service)" />
            <Button variant="secondary" size="sm" @click="startEdit(service)">Edit</Button>
            <Button variant="destructive" size="sm" @click="removeService(service.id)">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading services...</p>
  </div>
</template>
