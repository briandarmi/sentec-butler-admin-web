<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { MapPinnedIcon, NetworkIcon, PencilIcon, ShieldAlertIcon, TimerIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

useAuth()
const adminApi = useAdminApi()
const { can } = useAuthz()

const RESOURCE = 'requestMapping' as const

const items = ref<Awaited<ReturnType<typeof adminApi.listCategoryItems>>>([])
const categories = ref<Awaited<ReturnType<typeof adminApi.listCategories>>>([])
const hotelDepts = ref<Awaited<ReturnType<typeof adminApi.listHotelDepartments>>>([])
const slas = ref<Awaited<ReturnType<typeof adminApi.listSlas>>>([])

const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')

const isDialogOpen = ref(false)
const editingItem = ref<(typeof items.value)[number] | null>(null)
const formDepartmentId = ref('')
const formSlaId = ref('')
const formRemark = ref('')

const categoryNameById = computed(() => {
  const map = new Map<string, string>()
  for (const c of categories.value) map.set(c.id, c.name)
  return map
})

// requestMapping.departmentId is a Department.id; resolve the department name via
// the hotelDepartment whose departmentId matches, using hotelDepartment.department.name.
const departmentNameById = computed(() => {
  const map = new Map<string, string>()
  for (const hd of hotelDepts.value) {
    if (hd.department?.name) map.set(hd.departmentId, hd.department.name)
  }
  return map
})

const slaNameById = computed(() => {
  const map = new Map<string, string>()
  for (const s of slas.value) map.set(s.id, s.name)
  return map
})

const totalCount = computed(() => items.value.length)
const mappedCount = computed(() => items.value.filter(i => i.requestMapping).length)
const unmappedCount = computed(() => totalCount.value - mappedCount.value)

async function load() {
  if (!can('read', RESOURCE)) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [loadedItems, loadedCategories, loadedDepts, loadedSlas] = await Promise.all([
      adminApi.listCategoryItems(),
      adminApi.listCategories(),
      adminApi.listHotelDepartments(),
      adminApi.listSlas(),
    ])
    items.value = loadedItems
    categories.value = loadedCategories
    hotelDepts.value = loadedDepts
    slas.value = loadedSlas
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isLoading.value = false
  }
}

function startEdit(item: (typeof items.value)[number]) {
  editingItem.value = item
  formDepartmentId.value = item.requestMapping?.departmentId ?? ''
  formSlaId.value = item.requestMapping?.slaId ?? ''
  formRemark.value = item.requestMapping?.remark ?? ''
  errorMessage.value = ''
  isDialogOpen.value = true
}

async function save() {
  if (isSaving.value || !editingItem.value) return
  isSaving.value = true
  errorMessage.value = ''
  const item = editingItem.value
  try {
    await adminApi.upsertCategoryItem({
      id: item.id,
      categoryId: item.categoryId,
      iconId: item.iconId,
      name: item.name,
      itemQuantity: item.itemQuantity,
      hyperlink: item.hyperlink,
      isActive: item.isActive,
      requestMapping: {
        id: item.requestMapping?.id,
        departmentId: formDepartmentId.value,
        slaId: formSlaId.value,
        remark: formRemark.value,
      },
    })
    await load()
    isDialogOpen.value = false
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
  <div v-if="!can('read', RESOURCE)" class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <ShieldAlertIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">
      Access Restricted
    </h3>
    <p class="max-w-sm text-[#86868B]">
      You do not have permission to view staff routing.
    </p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">
          Staff Routing
        </h3>
        <p class="mt-1 text-2xl font-bold text-[#1D1D1F]">
          Request Mapping
        </p>
      </div>
    </div>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <!-- Summary stat cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card class="rounded-xl">
        <CardContent class="flex items-center gap-4 py-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7]">
            <NetworkIcon class="text-[#027BFF]" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-[#86868B]">
              Total items
            </p>
            <p class="text-2xl font-bold text-[#1D1D1F]">
              {{ totalCount }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-xl">
        <CardContent class="flex items-center gap-4 py-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7]">
            <MapPinnedIcon class="text-[#027BFF]" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-[#86868B]">
              Mapped
            </p>
            <p class="text-2xl font-bold text-[#1D1D1F]">
              {{ mappedCount }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card class="rounded-xl">
        <CardContent class="flex items-center gap-4 py-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F7]">
            <ShieldAlertIcon class="text-[#86868B]" />
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-[#86868B]">
              Unmapped
            </p>
            <p class="text-2xl font-bold text-[#1D1D1F]">
              {{ unmappedCount }}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>

    <p class="text-xs text-[#86868B]">
      Unmapped categories notify ALL staff; mapped categories notify only the assigned department (doc §11).
    </p>

    <p v-if="isLoading" class="text-xs text-[#86868B]">
      Loading...
    </p>

    <!-- Category item mappings -->
    <Card class="rounded-xl">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>SLA</TableHead>
              <TableHead class="text-right">
                Mapping
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in items" :key="item.id">
              <TableCell class="font-medium text-[#1D1D1F]">
                {{ item.name }}
              </TableCell>
              <TableCell class="text-[#86868B]">
                {{ categoryNameById.get(item.categoryId) ?? '—' }}
              </TableCell>
              <TableCell>
                <span v-if="item.requestMapping" class="text-[#1D1D1F]">
                  {{ departmentNameById.get(item.requestMapping.departmentId) ?? 'Unknown department' }}
                </span>
                <span v-else class="text-[#86868B]">—</span>
              </TableCell>
              <TableCell>
                <span v-if="item.requestMapping" class="text-[#1D1D1F]">
                  {{ slaNameById.get(item.requestMapping.slaId) ?? 'Unknown SLA' }}
                </span>
                <span v-else class="text-[#86868B]">—</span>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex items-center justify-end gap-3">
                  <Badge :variant="item.requestMapping ? 'success' : 'secondary'">
                    {{ item.requestMapping ? 'Mapped' : 'Unmapped' }}
                  </Badge>
                  <Button
                    v-if="can('write', RESOURCE)"
                    size="sm"
                    variant="outline"
                    @click="startEdit(item)"
                  >
                    <PencilIcon />
                    {{ item.requestMapping ? 'Edit mapping' : 'Assign' }}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="!isLoading && items.length === 0">
              <TableCell colspan="5" class="py-10 text-center text-sm text-[#86868B]">
                No category items found.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Mapping dialog -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {{ editingItem?.requestMapping ? 'Edit mapping' : 'Assign mapping' }}
          </DialogTitle>
          <DialogDescription>
            Route "{{ editingItem?.name }}" to a department and SLA.
          </DialogDescription>
        </DialogHeader>

        <Alert v-if="errorMessage" variant="destructive">
          <AlertTitle>Save failed</AlertTitle>
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <div class="space-y-5 py-2">
          <div class="space-y-2">
            <Label>Department</Label>
            <Select v-model="formDepartmentId">
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="hd in hotelDepts" :key="hd.id" :value="hd.departmentId">
                  {{ hd.department?.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>SLA</Label>
            <Select v-model="formSlaId">
              <SelectTrigger>
                <SelectValue placeholder="Select SLA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in slas" :key="s.id" :value="s.id">
                  {{ s.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Remark</Label>
            <Input v-model="formRemark" placeholder="Optional note for staff" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="isDialogOpen = false">
            Cancel
          </Button>
          <Button :disabled="isSaving" @click="save">
            <TimerIcon v-if="!isSaving" />
            {{ isSaving ? 'Saving...' : 'Save mapping' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
