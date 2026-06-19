<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PlusIcon, PencilIcon, NetworkIcon, ShieldAlertIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

useAuth()
const { can } = useAuthz()
const adminApi = useAdminApi()

const departments = ref<Awaited<ReturnType<typeof adminApi.listDepartments>>>([])
const hotelDepts = ref<Awaited<ReturnType<typeof adminApi.listHotelDepartments>>>([])

const isLoading = ref(false)
const isSaving = ref(false)
const togglingId = ref<string | undefined>(undefined)
const errorMessage = ref('')

const isFormDialogOpen = ref(false)
const editId = ref<string | undefined>(undefined)
const formName = ref('')

const canEditHotelDepartments = computed(() => can('write', 'hotelDepartments'))
const canEditDepartments = computed(() => can('write', 'departments'))

async function load() {
  if (!can('read', 'hotelDepartments')) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [depts, hDepts] = await Promise.all([
      adminApi.listDepartments(),
      adminApi.listHotelDepartments(),
    ])
    departments.value = depts
    hotelDepts.value = hDepts
  } catch (e) {
    errorMessage.value = String((e as Error).message)
  } finally {
    isLoading.value = false
  }
}

function isDeptActive(deptId: string): boolean {
  return hotelDepts.value.some(
    (hd) => hd.departmentId === deptId && hd.isActive && !hd.isRemoved,
  )
}

async function toggleDept(dept: { id: string }, newValue: boolean) {
  if (togglingId.value) return
  togglingId.value = dept.id
  errorMessage.value = ''
  try {
    await adminApi.upsertHotelDepartment({
      departmentId: dept.id,
      isActive: newValue,
      isRemoved: !newValue,
    })
    await load()
  } catch (e) {
    errorMessage.value = String((e as Error).message)
  } finally {
    togglingId.value = undefined
  }
}

function resetForm() {
  editId.value = undefined
  formName.value = ''
}

function openCreateDialog() {
  resetForm()
  isFormDialogOpen.value = true
}

function startEdit(dept: { id: string; name: string }) {
  editId.value = dept.id
  formName.value = dept.name
  isFormDialogOpen.value = true
}

async function save() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertDepartment({ id: editId.value, name: formName.value })
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
  <div v-if="!can('read', 'hotelDepartments')" class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <ShieldAlertIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">Access Denied</h3>
    <p class="max-w-sm text-[#86868B]">You do not have permission to view departments.</p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-[#1D1D1F]">Departments</h2>
        <p class="text-sm text-[#86868B]">Manage which departments are active for this hotel.</p>
      </div>
    </div>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <!-- Section 1: Hotel Departments -->
    <section class="space-y-4">
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Hotel Departments</h3>
      <Card class="rounded-xl">
        <CardContent>
          <div v-if="departments.length === 0 && !isLoading" class="py-6 text-center text-sm text-[#86868B]">
            No departments available.
          </div>
          <div v-else class="divide-y divide-[#E5E5E7]">
            <div
              v-for="dept in departments"
              :key="dept.id"
              class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F5F5F7]">
                  <NetworkIcon class="h-4 w-4 text-[#86868B]" />
                </div>
                <span class="font-medium text-[#1D1D1F]">{{ dept.name }}</span>
              </div>
              <div class="flex items-center gap-3">
                <Badge :variant="isDeptActive(dept.id) ? 'success' : 'secondary'">
                  {{ isDeptActive(dept.id) ? 'Active' : 'Inactive' }}
                </Badge>
                <Switch
                  :checked="isDeptActive(dept.id)"
                  :disabled="!canEditHotelDepartments || togglingId === dept.id"
                  @update:checked="(v: boolean) => toggleDept(dept, v)"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <Separator />

    <!-- Section 2: Global Departments -->
    <section class="space-y-4">
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Global Departments</h3>
        <Button v-if="canEditDepartments" size="sm" @click="openCreateDialog">
          <PlusIcon />
          New Department
        </Button>
      </div>

      <p v-if="!canEditDepartments" class="text-xs text-[#86868B]">
        Global departments are managed by superadmin.
      </p>

      <Card class="rounded-xl">
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead v-if="canEditDepartments" class="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="departments.length === 0 && !isLoading">
                <TableCell :colspan="canEditDepartments ? 2 : 1" class="text-center text-sm text-[#86868B]">
                  No departments yet.
                </TableCell>
              </TableRow>
              <TableRow v-for="dept in departments" :key="dept.id">
                <TableCell class="font-medium text-[#1D1D1F]">{{ dept.name }}</TableCell>
                <TableCell v-if="canEditDepartments" class="text-right">
                  <Button variant="ghost" size="sm" @click="startEdit(dept)">
                    <PencilIcon />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>

    <!-- Create / Edit Department Dialog -->
    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ editId ? 'Edit Department' : 'New Department' }}</DialogTitle>
          <DialogDescription>
            Global departments are shared across all hotels.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label for="department-name">Name</Label>
            <Input id="department-name" v-model="formName" placeholder="Housekeeping" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="isFormDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving || !formName.trim()" @click="save">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
