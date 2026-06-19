<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PlusIcon, PencilIcon, TimerIcon, StarIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

useAuth()
const { can } = useAuthz()
const adminApi = useAdminApi()

const slas = ref<Awaited<ReturnType<typeof adminApi.listSlas>>>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isFormDialogOpen = ref(false)
const errorMessage = ref('')

const editId = ref<string | undefined>(undefined)
const formName = ref('')
const formResponseTime = ref<number>(0)
const formResolutionTime = ref<number>(0)
const formIsDefault = ref(false)

const dialogTitle = computed(() => (editId.value ? 'Edit SLA' : 'New SLA'))

async function load() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    slas.value = await adminApi.listSlas()
  } catch (e) {
    errorMessage.value = String((e as Error).message)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  editId.value = undefined
  formName.value = ''
  formResponseTime.value = 0
  formResolutionTime.value = 0
  formIsDefault.value = false
  errorMessage.value = ''
}

function openCreateDialog() {
  resetForm()
  isFormDialogOpen.value = true
}

function startEdit(row: (typeof slas.value)[number]) {
  errorMessage.value = ''
  editId.value = row.id
  formName.value = row.name
  formResponseTime.value = row.responseTime
  formResolutionTime.value = row.resolutionTime
  formIsDefault.value = row.isDefault
  isFormDialogOpen.value = true
}

async function save() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertSla({
      id: editId.value,
      name: formName.value,
      responseTime: Number(formResponseTime.value),
      resolutionTime: Number(formResolutionTime.value),
      isDefault: formIsDefault.value,
    })
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
  <div class="space-y-8">
    <div class="flex items-end justify-between gap-4">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">SLA Configuration</h3>
        <p class="mt-1 text-sm text-[#86868B]">Define response and resolution targets for this hotel.</p>
      </div>
      <Button v-if="can('write', 'slas')" size="sm" @click="openCreateDialog">
        <PlusIcon />
        New SLA
      </Button>
    </div>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <Card class="rounded-xl">
      <CardContent>
        <div class="flex items-start gap-3">
          <TimerIcon class="mt-0.5 shrink-0 text-[#027BFF]" />
          <p class="text-sm text-[#1D1D1F]">
            <span class="font-semibold">Response Time</span> = NEW &rarr; IN PROGRESS.
            <span class="font-semibold">Resolution Time</span> = IN PROGRESS &rarr; FINISHED.
            One SLA can be the hotel default.
          </p>
        </div>
      </CardContent>
    </Card>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <Card class="rounded-xl">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Response Time</TableHead>
              <TableHead>Resolution Time</TableHead>
              <TableHead></TableHead>
              <TableHead class="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="sla in slas" :key="sla.id">
              <TableCell class="font-medium text-[#1D1D1F]">{{ sla.name }}</TableCell>
              <TableCell class="text-[#1D1D1F]">{{ sla.responseTime }} min</TableCell>
              <TableCell class="text-[#1D1D1F]">{{ sla.resolutionTime }} min</TableCell>
              <TableCell>
                <Badge v-if="sla.isDefault" variant="success">
                  <StarIcon />
                  Default
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button
                  v-if="can('write', 'slas')"
                  size="sm"
                  variant="outline"
                  @click="startEdit(sla)"
                >
                  <PencilIcon />
                  Edit
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="!isLoading && slas.length === 0">
              <TableCell colspan="5" class="py-10 text-center text-sm text-[#86868B]">
                No SLAs configured yet.
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
            Set the response and resolution targets, both measured in minutes.
          </DialogDescription>
        </DialogHeader>

        <Alert v-if="errorMessage" variant="destructive">
          <AlertTitle>Could not save</AlertTitle>
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <div class="space-y-5 py-2">
          <div class="space-y-2">
            <Label for="sla-name">Name</Label>
            <Input id="sla-name" v-model="formName" placeholder="e.g. Standard" />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="sla-response">Response Time (minutes)</Label>
              <Input id="sla-response" v-model="formResponseTime" type="number" min="0" />
            </div>
            <div class="space-y-2">
              <Label for="sla-resolution">Resolution Time (minutes)</Label>
              <Input id="sla-resolution" v-model="formResolutionTime" type="number" min="0" />
            </div>
          </div>

          <div class="flex items-center justify-between rounded-lg border border-[#E5E5E7] px-4 py-3">
            <Label for="sla-default" class="cursor-pointer">Set as hotel default</Label>
            <Switch id="sla-default" v-model:checked="formIsDefault" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="isFormDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving || !can('write', 'slas')" @click="save">
            {{ isSaving ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
