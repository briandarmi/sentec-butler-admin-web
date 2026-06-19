<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { MessageSquareIcon, PlusIcon, PencilIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

useAuth()
const adminApi = useAdminApi()
const { can } = useAuthz()

const templates = ref<Awaited<ReturnType<typeof adminApi.listTemplateMessages>>>([])
const messageCategories = ref<Awaited<ReturnType<typeof adminApi.listMessageCategories>>>([])

const isLoading = ref(false)
const errorMessage = ref('')

// ── Template dialog state ───────────────────────────────────────────────────
const isTemplateDialogOpen = ref(false)
const isSavingTemplate = ref(false)
const templateEditId = ref<string | undefined>(undefined)
const formMessageId = ref('')
const formTitle = ref('')

// ── Message category dialog state ───────────────────────────────────────────
const isCategoryDialogOpen = ref(false)
const isSavingCategory = ref(false)
const categoryEditId = ref<string | undefined>(undefined)
const formCategoryName = ref('')

const SAMPLE_WELCOME = 'Welcome to our hotel, {name}! Your room {room_number} is ready. Check-in: {check_in}, Check-out: {check_out}.'

const canWriteTemplates = computed(() => can('write', 'templateMessages'))
const canWriteCategories = computed(() => can('write', 'messageCategories'))

const placeholders = [
  { token: '{name}', label: 'Guest full name' },
  { token: '{check_in}', label: 'Check-in date' },
  { token: '{check_out}', label: 'Check-out date' },
  { token: '{room_number}', label: 'Assigned room number' },
]

function categoryName(id: string): string {
  return messageCategories.value.find(c => c.id === id)?.name ?? '—'
}

async function load() {
  isLoading.value = true
  errorMessage.value = ''

  // Templates are admin-accessible (hotel-scoped).
  try {
    templates.value = await adminApi.listTemplateMessages()
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }

  // The message-category catalog is a SUPERADMIN-only resource. Loading it must
  // not block the templates view for admins — fall back to the categories that
  // existing templates already reference so admins can still pick one.
  try {
    messageCategories.value = await adminApi.listMessageCategories()
  }
  catch {
    const seen = new Map<string, { id: string; name: string }>()
    for (const t of templates.value) {
      if (t.messageCategory) seen.set(t.messageCategory.id, t.messageCategory)
    }
    messageCategories.value = [...seen.values()]
  }
  finally {
    isLoading.value = false
  }
}

// ── Template actions ────────────────────────────────────────────────────────
function resetTemplateForm() {
  templateEditId.value = undefined
  formMessageId.value = messageCategories.value[0]?.id ?? ''
  formTitle.value = ''
}

function openCreateTemplate() {
  resetTemplateForm()
  isTemplateDialogOpen.value = true
}

function startEditTemplate(row: typeof templates.value[number]) {
  templateEditId.value = row.id
  formMessageId.value = row.messageId
  formTitle.value = row.title
  isTemplateDialogOpen.value = true
}

async function saveTemplate() {
  if (isSavingTemplate.value) return
  isSavingTemplate.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertTemplateMessage({
      id: templateEditId.value,
      messageId: formMessageId.value,
      title: formTitle.value,
    })
    await load()
    isTemplateDialogOpen.value = false
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSavingTemplate.value = false
  }
}

// ── Message category actions ────────────────────────────────────────────────
function resetCategoryForm() {
  categoryEditId.value = undefined
  formCategoryName.value = ''
}

function openCreateCategory() {
  resetCategoryForm()
  isCategoryDialogOpen.value = true
}

function startEditCategory(row: typeof messageCategories.value[number]) {
  categoryEditId.value = row.id
  formCategoryName.value = row.name
  isCategoryDialogOpen.value = true
}

async function saveCategory() {
  if (isSavingCategory.value) return
  isSavingCategory.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertMessageCategory({
      id: categoryEditId.value,
      name: formCategoryName.value,
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

onMounted(load)
</script>

<template>
  <div class="space-y-8">
    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#1D1D1F]">Message Templates</h1>
        <p class="mt-1 text-sm text-[#86868B]">Compose guest-facing message templates with dynamic placeholders.</p>
      </div>
      <Button v-if="canWriteTemplates" size="sm" @click="openCreateTemplate">
        <PlusIcon />
        New Template
      </Button>
    </div>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <!-- ── Placeholder helper card ────────────────────────────────────────── -->
    <Card class="rounded-xl border-[#E5E5E7]">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-base">
          <MessageSquareIcon class="h-4 w-4 text-[#027BFF]" />
          Supported Placeholders
        </CardTitle>
        <CardDescription>
          These tokens are replaced with live guest data when a message is sent.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <Badge v-for="p in placeholders" :key="p.token" variant="secondary" class="font-mono">
            {{ p.token }}
            <span class="ml-1 font-sans font-normal text-[#86868B]">· {{ p.label }}</span>
          </Badge>
        </div>
        <p class="text-xs text-[#86868B]">
          Note: welcoming messages appear only on the guest's first day.
        </p>
      </CardContent>
    </Card>

    <!-- ── Templates list ─────────────────────────────────────────────────── -->
    <section class="space-y-4">
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Templates</h3>

      <Card class="rounded-xl border-[#E5E5E7]">
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead class="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="t in templates" :key="t.id">
                <TableCell class="max-w-md truncate font-medium text-[#1D1D1F]">
                  {{ t.title }}
                </TableCell>
                <TableCell class="text-[#86868B]">
                  {{ t.messageCategory?.name ?? categoryName(t.messageId) }}
                </TableCell>
                <TableCell class="text-right">
                  <Button v-if="canWriteTemplates" variant="outline" size="sm" @click="startEditTemplate(t)">
                    <PencilIcon class="h-3 w-3" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow v-if="!isLoading && templates.length === 0">
                <TableCell colspan="3" class="py-10 text-center text-sm text-[#86868B]">
                  No templates yet.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>

    <Separator />

    <!-- ── Message Categories subsection ──────────────────────────────────── -->
    <section class="space-y-4">
      <div class="flex items-center justify-between gap-4">
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Message Categories</h3>
        <Button v-if="canWriteCategories" size="sm" variant="outline" @click="openCreateCategory">
          <PlusIcon />
          New Category
        </Button>
      </div>

      <p v-if="!canWriteCategories" class="text-xs text-[#86868B]">
        Message categories are managed by superadmins. This list is read-only.
      </p>

      <Card class="rounded-xl border-[#E5E5E7]">
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead class="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="c in messageCategories" :key="c.id">
                <TableCell class="font-medium text-[#1D1D1F]">{{ c.name }}</TableCell>
                <TableCell class="text-right">
                  <Button v-if="canWriteCategories" variant="outline" size="sm" @click="startEditCategory(c)">
                    <PencilIcon class="h-3 w-3" />
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow v-if="!isLoading && messageCategories.length === 0">
                <TableCell colspan="2" class="py-10 text-center text-sm text-[#86868B]">
                  No message categories.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>

    <!-- ── Template Dialog ────────────────────────────────────────────────── -->
    <Dialog v-model:open="isTemplateDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ templateEditId ? 'Edit Template' : 'New Template' }}</DialogTitle>
          <DialogDescription>
            Choose a category and write the message body using the supported placeholders.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-2">
          <div class="space-y-2">
            <Label for="tpl-category">Category</Label>
            <Select id="tpl-category" v-model="formMessageId">
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in messageCategories" :key="c.id" :value="c.id">
                  {{ c.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="tpl-title">Message</Label>
            <Textarea
              id="tpl-title"
              v-model="formTitle"
              rows="4"
              :placeholder="SAMPLE_WELCOME"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isTemplateDialogOpen = false">Cancel</Button>
          <Button :disabled="isSavingTemplate || !formMessageId || !formTitle.trim()" @click="saveTemplate">
            {{ isSavingTemplate ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- ── Category Dialog ────────────────────────────────────────────────── -->
    <Dialog v-model:open="isCategoryDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ categoryEditId ? 'Edit Category' : 'New Category' }}</DialogTitle>
          <DialogDescription>Name the message category.</DialogDescription>
        </DialogHeader>

        <div class="space-y-2 py-2">
          <Label for="cat-name">Name</Label>
          <Input id="cat-name" v-model="formCategoryName" placeholder="e.g. Welcome" />
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isCategoryDialogOpen = false">Cancel</Button>
          <Button :disabled="isSavingCategory || !formCategoryName.trim()" @click="saveCategory">
            {{ isSavingCategory ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
