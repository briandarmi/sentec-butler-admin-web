<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { UtensilsCrossedIcon, PlusIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'

const adminApi = useAdminApi()

const categories = ref<Awaited<ReturnType<typeof adminApi.listCategories>>>([])
const outlets = ref<Awaited<ReturnType<typeof adminApi.listCategoryItems>>>([])

const editId = ref<string | undefined>(undefined)
const formName = ref('')
const formCategoryId = ref('1')
const formActive = ref(true)
const isLoading = ref(false)
const isSaving = ref(false)
const isFormDialogOpen = ref(false)

const categoryById = computed(() => Object.fromEntries(categories.value.map((item) => [item.id, item.name])))

async function loadOutlets() {
  isLoading.value = true
  try {
    const [categoryRows, itemRows] = await Promise.all([adminApi.listCategories(), adminApi.listCategoryItems()])
    categories.value = categoryRows
    outlets.value = itemRows

    const firstCategory = categoryRows[0]
    if (!formCategoryId.value && firstCategory) {
      formCategoryId.value = firstCategory.id
    }
  }
  finally {
    isLoading.value = false
  }
}

function resetForm() {
  editId.value = undefined
  formName.value = ''
  formCategoryId.value = categories.value[0]?.id ?? '1'
  formActive.value = true
}

function openCreateDialog() {
  resetForm()
  isFormDialogOpen.value = true
}

function startEdit(outlet: (typeof outlets.value)[number]) {
  editId.value = outlet.id
  formName.value = outlet.name
  formCategoryId.value = outlet.categoryId
  formActive.value = outlet.isActive
  isFormDialogOpen.value = true
}

async function saveOutlet() {
  if (!formName.value.trim() || isSaving.value) {
    return
  }

  isSaving.value = true
  try {
    await adminApi.upsertCategoryItem({
      id: editId.value,
      categoryId: formCategoryId.value,
      name: formName.value,
      isActive: formActive.value,
    })

    await loadOutlets()
    resetForm()
    isFormDialogOpen.value = false
  }
  finally {
    isSaving.value = false
  }
}

async function toggleOutlet(outlet: (typeof outlets.value)[number]) {
  await adminApi.upsertCategoryItem({
    id: outlet.id,
    categoryId: outlet.categoryId,
    name: outlet.name,
    isActive: !outlet.isActive,
  })

  await loadOutlets()
}

async function removeOutlet(id: string) {
  await adminApi.deleteCategoryItem(id)
  await loadOutlets()
}

onMounted(loadOutlets)
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Hotel Outlets</h3>
      <Button size="sm" @click="openCreateDialog">
        <PlusIcon />
        New Outlet
      </Button>
    </div>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ editId ? 'Edit Outlet' : 'Create Outlet' }}</DialogTitle>
          <DialogDescription>Create or update an outlet visible to guests.</DialogDescription>
        </DialogHeader>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="space-y-2">
            <Label>Outlet Name</Label>
            <Input v-model="formName" type="text" placeholder="Outlet name" />
          </div>
          <div class="space-y-2">
            <Label>Type</Label>
            <Select v-model="formCategoryId">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="md:col-span-2 flex items-center justify-between rounded-xl border border-[#E5E5E7] bg-[#F5F5F7] p-3">
            <p class="text-sm">Outlet Active</p>
            <Switch v-model:checked="formActive" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" @click="isFormDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving" @click="saveOutlet">{{ isSaving ? 'Saving...' : editId ? 'Update Outlet' : 'Create Outlet' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="space-y-3">
      <Card
        v-for="outlet in outlets"
        :key="outlet.id"
      >
        <CardContent class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-[#F5F5F7] p-2">
              <UtensilsCrossedIcon />
            </div>
            <div>
              <h4 class="text-sm font-semibold">{{ outlet.name }}</h4>
              <p class="text-[10px] uppercase tracking-wider text-[#86868B]">{{ categoryById[outlet.categoryId] ?? 'Unknown' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Badge :variant="outlet.isActive ? 'success' : 'secondary'">{{ outlet.isActive ? 'Open' : 'Closed' }}</Badge>
            <Button variant="secondary" size="sm" @click="startEdit(outlet)">Edit</Button>
            <Button variant="destructive" size="sm" @click="removeOutlet(outlet.id)">Delete</Button>
            <Switch :checked="outlet.isActive" @update:checked="() => toggleOutlet(outlet)" />
          </div>
        </CardContent>
      </Card>
    </div>
    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading outlets...</p>
  </div>
</template>
