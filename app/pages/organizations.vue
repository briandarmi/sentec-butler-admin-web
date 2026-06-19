<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Building2Icon, HotelIcon, PencilIcon, PlusIcon, ShieldAlertIcon } from '@lucide/vue'
import { useAdminApi, type Hotel, type Organization } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const { can } = useAuthz()
useAuth()

const organizations = ref<Organization[]>([])
const hotels = ref<Hotel[]>([])

const isLoading = ref(false)
const isSaving = ref(false)
const isFormDialogOpen = ref(false)
const errorMessage = ref('')

const editId = ref<string | undefined>(undefined)
const formName = ref('')

const dialogTitle = computed(() => (editId.value ? 'Edit Organization' : 'New Organization'))

function hotelCount(orgId: string): number {
  return hotels.value.filter((h) => h.organizationId === orgId).length
}

async function load() {
  if (!can('read', 'organizations')) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [orgs, hotelList] = await Promise.all([
      adminApi.listOrganizations(),
      adminApi.listHotels(),
    ])
    organizations.value = orgs
    hotels.value = hotelList
  } catch (e) {
    errorMessage.value = String((e as Error).message)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  editId.value = undefined
  formName.value = ''
  errorMessage.value = ''
}

function openCreateDialog() {
  resetForm()
  isFormDialogOpen.value = true
}

function startEdit(org: Organization) {
  errorMessage.value = ''
  editId.value = org.id
  formName.value = org.name
  isFormDialogOpen.value = true
}

async function save() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertOrganization({ id: editId.value, name: formName.value })
    await load()
    isFormDialogOpen.value = false
  } catch (e) {
    errorMessage.value = String((e as Error).message)
  } finally {
    isSaving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-if="!can('read', 'organizations')" class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <ShieldAlertIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">Superadmin Access Only</h3>
    <p class="max-w-sm text-[#86868B]">This section is available only to superadmin users.</p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Organizations</h3>
        <p class="mt-1 text-sm text-[#86868B]">Manage organizations and view how many hotels belong to each.</p>
      </div>
      <Button v-if="can('write', 'organizations')" size="sm" @click="openCreateDialog">
        <PlusIcon />
        New Organization
      </Button>
    </div>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <Card class="rounded-xl">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Hotels</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="org in organizations" :key="org.id">
              <TableCell>
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F7]">
                    <Building2Icon class="h-4 w-4 text-[#86868B]" />
                  </div>
                  <span class="font-medium text-[#1D1D1F]">{{ org.name }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" class="gap-1">
                  <HotelIcon class="h-3 w-3" />
                  {{ hotelCount(org.id) }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  v-if="can('write', 'organizations')"
                  variant="outline"
                  size="sm"
                  @click="startEdit(org)"
                >
                  <PencilIcon />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!isLoading && organizations.length === 0">
              <TableCell colspan="3" class="py-10 text-center text-sm text-[#86868B]">
                No organizations yet.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ dialogTitle }}</DialogTitle>
          <DialogDescription>
            {{ editId ? 'Update the organization name.' : 'Create a new organization.' }}
          </DialogDescription>
        </DialogHeader>

        <Alert v-if="errorMessage" variant="destructive">
          <AlertTitle>Save failed</AlertTitle>
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <div class="space-y-2">
          <Label for="org-name">Name</Label>
          <Input id="org-name" v-model="formName" placeholder="Organization name" />
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isFormDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving || !formName.trim()" @click="save">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
