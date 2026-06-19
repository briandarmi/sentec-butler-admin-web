<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PlusIcon, PencilIcon, UsersIcon } from '@lucide/vue'
import { useAdminApi, type AdminUser, type HotelDepartment, type UserProfile } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const { can } = useAuthz()
useAuth()

const users = ref<AdminUser[]>([])
const hotelDepts = ref<HotelDepartment[]>([])

const isLoading = ref(false)
const isSaving = ref(false)
const isFormDialogOpen = ref(false)
const errorMessage = ref('')

const editId = ref<string | undefined>(undefined)
const editProfileId = ref<string | undefined>(undefined)

const formFirstName = ref('')
const formLastName = ref('')
const formEmail = ref('')
const formActive = ref(true)
const formDepartmentId = ref('')
const formPosition = ref('')
const formIsAdmin = ref(false)
const formIsLeader = ref(false)
const formCreateTicket = ref(false)

const dialogTitle = computed(() => (editId.value ? 'Edit User' : 'New User'))

function activeProfile(user: AdminUser): UserProfile | undefined {
  return user.profiles.find(p => p.hotelId === adminApi.hotelId.value)
}

function roleLabel(user: AdminUser): string {
  const profile = activeProfile(user)
  if (profile?.isAdmin) return 'Admin'
  if (profile?.isLeader) return 'Leader'
  return 'Staff'
}

function roleVariant(user: AdminUser): 'default' | 'secondary' | 'outline' {
  const profile = activeProfile(user)
  if (profile?.isAdmin) return 'default'
  if (profile?.isLeader) return 'secondary'
  return 'outline'
}

async function load() {
  if (!can('read', 'users')) return
  isLoading.value = true
  try {
    const [userList, deptList] = await Promise.all([
      adminApi.listUsers(),
      adminApi.listHotelDepartments(),
    ])
    users.value = userList
    hotelDepts.value = deptList
  }
  finally {
    isLoading.value = false
  }
}

function resetForm() {
  editId.value = undefined
  editProfileId.value = undefined
  formFirstName.value = ''
  formLastName.value = ''
  formEmail.value = ''
  formActive.value = true
  formDepartmentId.value = ''
  formPosition.value = ''
  formIsAdmin.value = false
  formIsLeader.value = false
  formCreateTicket.value = false
}

function openCreateDialog() {
  errorMessage.value = ''
  resetForm()
  isFormDialogOpen.value = true
}

function startEdit(user: AdminUser) {
  errorMessage.value = ''
  resetForm()
  editId.value = user.id
  formFirstName.value = user.firstName
  formLastName.value = user.lastName
  formEmail.value = user.email
  formActive.value = user.isActive

  const profile = activeProfile(user)
  if (profile) {
    editProfileId.value = profile.id
    formDepartmentId.value = profile.departmentId
    formPosition.value = profile.position ?? ''
    formIsAdmin.value = profile.isAdmin
    formIsLeader.value = profile.isLeader
    formCreateTicket.value = profile.createTicket
  }

  isFormDialogOpen.value = true
}

async function save() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertUser({
      id: editId.value,
      firstName: formFirstName.value,
      lastName: formLastName.value,
      email: formEmail.value,
      isActive: formActive.value,
      profiles: [
        {
          id: editProfileId.value,
          hotelId: adminApi.hotelId.value,
          departmentId: formDepartmentId.value,
          position: formPosition.value || null,
          isAdmin: formIsAdmin.value,
          isLeader: formIsLeader.value,
          createTicket: formCreateTicket.value,
          isActive: true,
        },
      ],
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
  <div v-if="!can('read', 'users')" class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <UsersIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">No Access</h3>
    <p class="max-w-sm text-[#86868B]">You do not have permission to view users for this hotel.</p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Users &amp; Roles</h3>
        <p class="mt-1 text-sm text-[#86868B]">Manage user accounts and their role at this hotel.</p>
      </div>
      <Button v-if="can('write', 'users')" size="sm" @click="openCreateDialog">
        <PlusIcon />
        New User
      </Button>
    </div>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Card v-for="user in users" :key="user.id" class="rounded-xl border-[#E5E5E7]">
        <CardContent class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate font-semibold text-[#1D1D1F]">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="truncate text-sm text-[#86868B]">{{ user.email }}</p>
            </div>
            <Button
              v-if="can('write', 'users')"
              variant="outline"
              size="sm"
              @click="startEdit(user)"
            >
              <PencilIcon />
              Edit
            </Button>
          </div>

          <div class="flex flex-wrap gap-2">
            <Badge :variant="roleVariant(user)">{{ roleLabel(user) }}</Badge>
            <Badge v-if="activeProfile(user)?.createTicket" variant="outline">Can create tickets</Badge>
            <Badge v-if="user.superAdmin" variant="secondary">Superadmin</Badge>
          </div>

          <Separator />

          <div class="flex flex-wrap gap-2">
            <Badge :variant="user.isActive ? 'success' : 'secondary'">
              {{ user.isActive ? 'Active' : 'Inactive' }}
            </Badge>
            <Badge :variant="user.isVerified ? 'success' : 'secondary'">
              {{ user.isVerified ? 'Verified' : 'Unverified' }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <p v-if="!isLoading && users.length === 0" class="text-sm text-[#86868B]">No users found for this hotel.</p>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ dialogTitle }}</DialogTitle>
          <DialogDescription>Manage the user's details and their role at this hotel.</DialogDescription>
        </DialogHeader>

        <div class="space-y-6 py-2">
          <div class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <Label for="firstName">First name</Label>
                <Input id="firstName" v-model="formFirstName" placeholder="First name" />
              </div>
              <div class="space-y-2">
                <Label for="lastName">Last name</Label>
                <Input id="lastName" v-model="formLastName" placeholder="Last name" />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" v-model="formEmail" type="email" placeholder="name@example.com" />
            </div>

            <div class="flex items-center justify-between rounded-lg border border-[#E5E5E7] px-4 py-3">
              <div>
                <Label for="userActive">Active</Label>
                <p class="text-xs text-[#86868B]">Allow this user to sign in.</p>
              </div>
              <Switch id="userActive" v-model:checked="formActive" />
            </div>
          </div>

          <Separator />

          <div class="space-y-4">
            <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Role at this hotel</h3>

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
              <Label for="position">Position</Label>
              <Input id="position" v-model="formPosition" placeholder="e.g. Front Desk Manager" />
            </div>

            <div class="flex items-center justify-between rounded-lg border border-[#E5E5E7] px-4 py-3">
              <div>
                <Label for="isAdmin">Admin</Label>
                <p class="text-xs text-[#86868B]">Full management access for this hotel.</p>
              </div>
              <Switch id="isAdmin" v-model:checked="formIsAdmin" />
            </div>

            <div class="flex items-center justify-between rounded-lg border border-[#E5E5E7] px-4 py-3">
              <div>
                <Label for="isLeader">Leader</Label>
                <p class="text-xs text-[#86868B]">Team lead within their department.</p>
              </div>
              <Switch id="isLeader" v-model:checked="formIsLeader" />
            </div>

            <div class="flex items-center justify-between rounded-lg border border-[#E5E5E7] px-4 py-3">
              <div>
                <Label for="createTicket">Can create tickets</Label>
                <p class="text-xs text-[#86868B]">Allow raising new service tickets.</p>
              </div>
              <Switch id="createTicket" v-model:checked="formCreateTicket" />
            </div>
          </div>

          <Alert v-if="errorMessage" variant="destructive">
            <AlertTitle>Save failed</AlertTitle>
            <AlertDescription>{{ errorMessage }}</AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="isFormDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving" @click="save">{{ isSaving ? 'Saving...' : 'Save' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
