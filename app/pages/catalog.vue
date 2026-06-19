<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ExternalLinkIcon } from '@lucide/vue'
import { useAdminApi, type CategoryItem, type Category, type Icon } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const { can } = useAuthz()
useAuth()

const items = ref<CategoryItem[]>([])
const categories = ref<Category[]>([])
const icons = ref<Icon[]>([])

const isLoading = ref(false)
const errorMessage = ref('')

async function load() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [itemRows, categoryRows, iconRows] = await Promise.all([
      adminApi.listCategoryItems(),
      adminApi.listCategories(),
      adminApi.listIcons(),
    ])
    items.value = itemRows
    categories.value = categoryRows
    icons.value = iconRows
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isLoading.value = false
  }
}

function categoryName(categoryId: string): string {
  return categories.value.find(c => c.id === categoryId)?.name ?? 'Uncategorized'
}

// ── Item dialog ─────────────────────────────────────────────────────────────
const isItemDialogOpen = ref(false)
const isSavingItem = ref(false)
const itemEditId = ref<string | undefined>(undefined)
const itemName = ref('')
const itemCategoryId = ref('')
const itemIconId = ref('')
const itemQuantity = ref(false)
const itemHyperlink = ref('')
const itemIsActive = ref(true)

function resetItemForm() {
  itemEditId.value = undefined
  itemName.value = ''
  itemCategoryId.value = categories.value[0]?.id ?? ''
  itemIconId.value = icons.value[0]?.id ?? ''
  itemQuantity.value = false
  itemHyperlink.value = ''
  itemIsActive.value = true
}

function openCreateItem() {
  resetItemForm()
  isItemDialogOpen.value = true
}

function startEditItem(row: CategoryItem) {
  itemEditId.value = row.id
  itemName.value = row.name
  itemCategoryId.value = row.categoryId
  itemIconId.value = row.iconId
  itemQuantity.value = row.itemQuantity
  itemHyperlink.value = row.hyperlink ?? ''
  itemIsActive.value = row.isActive
  isItemDialogOpen.value = true
}

async function saveItem() {
  if (isSavingItem.value) return
  isSavingItem.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertCategoryItem({
      id: itemEditId.value,
      categoryId: itemCategoryId.value,
      iconId: itemIconId.value,
      name: itemName.value,
      itemQuantity: itemQuantity.value,
      hyperlink: itemHyperlink.value.trim() ? itemHyperlink.value.trim() : null,
      isActive: itemIsActive.value,
      // requestMapping intentionally omitted to preserve existing routing
    })
    await load()
    isItemDialogOpen.value = false
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSavingItem.value = false
  }
}

async function deleteItem(row: CategoryItem) {
  errorMessage.value = ''
  try {
    await adminApi.deleteCategoryItem(row.id)
    await load()
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
}

// ── Category dialog (superadmin write) ───────────────────────────────────────
const isCategoryDialogOpen = ref(false)
const isSavingCategory = ref(false)
const categoryEditId = ref<string | undefined>(undefined)
const categoryName_ = ref('')
const categoryIconId = ref('')

function resetCategoryForm() {
  categoryEditId.value = undefined
  categoryName_.value = ''
  categoryIconId.value = icons.value[0]?.id ?? ''
}

function openCreateCategory() {
  resetCategoryForm()
  isCategoryDialogOpen.value = true
}

function startEditCategory(row: Category) {
  categoryEditId.value = row.id
  categoryName_.value = row.name
  categoryIconId.value = row.iconId
  isCategoryDialogOpen.value = true
}

async function saveCategory() {
  if (isSavingCategory.value) return
  isSavingCategory.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertCategory({
      id: categoryEditId.value,
      name: categoryName_.value,
      iconId: categoryIconId.value,
    })
    await load()
    isCategoryDialogOpen.value = false
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSavingCategory.value = false
  }
}

const canWriteCategories = computed(() => can('write', 'categories'))

onMounted(load)
</script>

<template>
  <div v-if="!can('read', 'categoryItems')" class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <ShieldAlertIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">No Access</h3>
    <p class="max-w-sm text-[#86868B]">You do not have permission to view this section.</p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Catalog</h3>
        <p class="mt-1 text-[#86868B]">Manage guest-facing categories and the items inside them.</p>
      </div>
    </div>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <Tabs default-value="items">
      <TabsList>
        <TabsTrigger value="items">Items</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
      </TabsList>

      <!-- ITEMS TAB ─────────────────────────────────────────────────────── -->
      <TabsContent value="items" class="space-y-4">
        <div class="flex items-center justify-end">
          <Button v-if="can('write', 'categoryItems')" size="sm" @click="openCreateItem">
            <PlusIcon />
            New Item
          </Button>
        </div>

        <p v-if="!isLoading && items.length === 0" class="text-[#86868B]">No items yet.</p>

        <div class="grid gap-3">
          <Card v-for="item in items" :key="item.id" class="rounded-xl">
            <CardContent class="flex items-center justify-between gap-4">
              <div class="flex min-w-0 items-center gap-3">
                <span class="text-2xl leading-none">{{ item.icon?.icon ?? '•' }}</span>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="truncate font-semibold text-[#1D1D1F]">{{ item.name }}</p>
                    <a
                      v-if="item.hyperlink"
                      :href="item.hyperlink"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center text-[#027BFF]"
                    >
                      <ExternalLinkIcon class="h-4 w-4" />
                    </a>
                  </div>
                  <p class="truncate text-xs text-[#86868B]">{{ categoryName(item.categoryId) }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Badge v-if="item.itemQuantity" variant="secondary">Quantity enabled</Badge>
                <Badge :variant="item.isActive ? 'success' : 'secondary'">{{ item.isActive ? 'Active' : 'Inactive' }}</Badge>

                <template v-if="can('write', 'categoryItems')">
                  <Button variant="outline" size="sm" @click="startEditItem(item)">
                    <PencilIcon />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" @click="deleteItem(item)">
                    <Trash2Icon />
                    Delete
                  </Button>
                </template>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- CATEGORIES TAB ────────────────────────────────────────────────── -->
      <TabsContent value="categories" class="space-y-4">
        <div class="flex items-center justify-between">
          <p v-if="!canWriteCategories" class="text-xs text-[#86868B]">Categories are managed by superadmin.</p>
          <span v-else />
          <Button v-if="canWriteCategories" size="sm" @click="openCreateCategory">
            <PlusIcon />
            New Category
          </Button>
        </div>

        <p v-if="!isLoading && categories.length === 0" class="text-[#86868B]">No categories yet.</p>

        <div class="grid gap-3">
          <Card v-for="category in categories" :key="category.id" class="rounded-xl">
            <CardContent class="flex items-center justify-between gap-4">
              <div class="flex min-w-0 items-center gap-3">
                <span class="text-2xl leading-none">{{ category.icon?.icon ?? '•' }}</span>
                <p class="truncate font-semibold text-[#1D1D1F]">{{ category.name }}</p>
              </div>

              <Button v-if="canWriteCategories" variant="outline" size="sm" @click="startEditCategory(category)">
                <PencilIcon />
                Edit
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <!-- ITEM DIALOG ──────────────────────────────────────────────────────── -->
    <Dialog v-model:open="isItemDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ itemEditId ? 'Edit Item' : 'New Item' }}</DialogTitle>
          <DialogDescription>Configure a guest-facing catalog item.</DialogDescription>
        </DialogHeader>

        <div class="space-y-5 py-2">
          <div class="space-y-2">
            <Label for="item-name">Name</Label>
            <Input id="item-name" v-model="itemName" placeholder="Item name" />
          </div>

          <div class="space-y-2">
            <Label for="item-category">Category</Label>
            <Select v-model="itemCategoryId">
              <SelectTrigger id="item-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="item-icon">Icon</Label>
            <Select v-model="itemIconId">
              <SelectTrigger id="item-icon">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="i in icons" :key="i.id" :value="i.id">{{ i.icon }} {{ i.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center justify-between gap-4">
            <Label for="item-quantity">Show quantity field to guests</Label>
            <Switch id="item-quantity" v-model:checked="itemQuantity" />
          </div>

          <div class="space-y-2">
            <Label for="item-hyperlink">Hyperlink</Label>
            <Input id="item-hyperlink" v-model="itemHyperlink" placeholder="https://..." />
            <p class="text-xs text-[#86868B]">External link — non-ticket category</p>
          </div>

          <div class="flex items-center justify-between gap-4">
            <Label for="item-active">Active</Label>
            <Switch id="item-active" v-model:checked="itemIsActive" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isItemDialogOpen = false">Cancel</Button>
          <Button :disabled="isSavingItem" @click="saveItem">
            {{ isSavingItem ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- CATEGORY DIALOG ──────────────────────────────────────────────────── -->
    <Dialog v-model:open="isCategoryDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ categoryEditId ? 'Edit Category' : 'New Category' }}</DialogTitle>
          <DialogDescription>Categories are shared across hotels.</DialogDescription>
        </DialogHeader>

        <div class="space-y-5 py-2">
          <div class="space-y-2">
            <Label for="category-name">Name</Label>
            <Input id="category-name" v-model="categoryName_" placeholder="Category name" />
          </div>

          <div class="space-y-2">
            <Label for="category-icon">Icon</Label>
            <Select v-model="categoryIconId">
              <SelectTrigger id="category-icon">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="i in icons" :key="i.id" :value="i.id">{{ i.icon }} {{ i.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isCategoryDialogOpen = false">Cancel</Button>
          <Button :disabled="isSavingCategory" @click="saveCategory">
            {{ isSavingCategory ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
