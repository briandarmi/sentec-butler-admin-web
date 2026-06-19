<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Building2Icon,
  PencilIcon,
  PlusIcon,
  ShieldAlertIcon,
  Trash2Icon,
} from '@lucide/vue'
import { useAdminApi, type Hotel } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const { can } = useAuthz()
useAuth()

const RESOURCE = 'hotels' as const

const hotels = ref<Hotel[]>([])
const organizations = ref<Awaited<ReturnType<typeof adminApi.listOrganizations>>>([])
const countries = ref<Awaited<ReturnType<typeof adminApi.listCountries>>>([])
const languages = ref<Awaited<ReturnType<typeof adminApi.listLanguages>>>([])
const timezones = ref<Awaited<ReturnType<typeof adminApi.listTimezones>>>([])

const isLoading = ref(false)
const isSaving = ref(false)
const isFormDialogOpen = ref(false)
const editId = ref<string | undefined>(undefined)
const errorMessage = ref('')

// ── form fields ─────────────────────────────────────────────────────────────
const formName = ref('')
const formOrganizationId = ref('')
const formCountryId = ref('')
const formLanguageId = ref('')
const formTimezoneId = ref('')
const formPhone = ref('')
const formAddress = ref('')
const formEmail = ref('')
const formWebsite = ref('')
const formLogo = ref('')
const formPrimaryColor = ref('#027BFF')
const formSecondaryColor = ref('#1D1D1F')
const formActive = ref(true)

const organizationNameById = computed(() => {
  const map = new Map<string, string>()
  for (const org of organizations.value) map.set(org.id, org.name)
  return map
})

function organizationName(organizationId: string): string {
  return organizationNameById.value.get(organizationId) ?? '—'
}

async function load() {
  if (!can('read', RESOURCE)) return
  isLoading.value = true
  try {
    const [h, o, c, l, t] = await Promise.all([
      adminApi.listHotels(),
      adminApi.listOrganizations(),
      adminApi.listCountries(),
      adminApi.listLanguages(),
      adminApi.listTimezones(),
    ])
    hotels.value = h
    organizations.value = o
    countries.value = c
    languages.value = l
    timezones.value = t
  }
  finally {
    isLoading.value = false
  }
}

function resetForm() {
  editId.value = undefined
  formName.value = ''
  formOrganizationId.value = ''
  formCountryId.value = ''
  formLanguageId.value = ''
  formTimezoneId.value = ''
  formPhone.value = ''
  formAddress.value = ''
  formEmail.value = ''
  formWebsite.value = ''
  formLogo.value = ''
  formPrimaryColor.value = '#027BFF'
  formSecondaryColor.value = '#1D1D1F'
  formActive.value = true
}

function openCreateDialog() {
  errorMessage.value = ''
  resetForm()
  isFormDialogOpen.value = true
}

function startEdit(row: Hotel) {
  errorMessage.value = ''
  editId.value = row.id
  formName.value = row.name
  formOrganizationId.value = row.organizationId ?? ''
  formCountryId.value = row.countryId ?? ''
  formLanguageId.value = row.languageId ?? ''
  formTimezoneId.value = row.timezoneId ?? ''
  formPhone.value = row.phone ?? ''
  formAddress.value = row.address ?? ''
  formEmail.value = row.email ?? ''
  formWebsite.value = row.website ?? ''
  formLogo.value = row.logo ?? ''
  formPrimaryColor.value = row.primaryColor ?? '#027BFF'
  formSecondaryColor.value = row.secondaryColor ?? '#1D1D1F'
  formActive.value = row.isActive
  isFormDialogOpen.value = true
}

async function save() {
  if (isSaving.value) return
  errorMessage.value = ''
  isSaving.value = true
  try {
    await adminApi.upsertHotel({
      ...(editId.value ? { id: editId.value } : {}),
      name: formName.value,
      organizationId: formOrganizationId.value,
      countryId: formCountryId.value,
      languageId: formLanguageId.value,
      timezoneId: formTimezoneId.value || null,
      phone: formPhone.value || null,
      address: formAddress.value || null,
      email: formEmail.value || null,
      website: formWebsite.value || null,
      logo: formLogo.value || null,
      primaryColor: formPrimaryColor.value || null,
      secondaryColor: formSecondaryColor.value || null,
      isActive: formActive.value,
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

async function removeHotel(row: Hotel) {
  errorMessage.value = ''
  try {
    await adminApi.deleteHotel(row.id)
    await load()
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
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
      Superadmin Access Only
    </h3>
    <p class="max-w-sm text-[#86868B]">
      This section is available only to superadmin users.
    </p>
  </div>

  <div v-else class="space-y-8">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">
          Hotels
        </h3>
        <p class="mt-1 text-sm text-[#86868B]">
          Manage hotel properties across all organizations.
        </p>
      </div>
      <Button v-if="can('write', RESOURCE)" size="sm" @click="openCreateDialog">
        <PlusIcon />
        New Hotel
      </Button>
    </div>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <p v-if="isLoading" class="text-xs text-[#86868B]">
      Loading...
    </p>

    <div v-if="!isLoading && hotels.length === 0" class="flex flex-col items-center justify-center rounded-xl bg-white py-16 text-center shadow-sm">
      <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F7]">
        <Building2Icon class="text-[#C7C7CC]" />
      </div>
      <h4 class="mb-1 text-base font-semibold text-[#1D1D1F]">
        No hotels yet
      </h4>
      <p class="max-w-sm text-sm text-[#86868B]">
        Create your first hotel to get started.
      </p>
    </div>

    <div v-else-if="!isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card v-for="hotel in hotels" :key="hotel.id" class="rounded-xl">
        <CardHeader>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <CardTitle class="truncate text-[#1D1D1F]">
                {{ hotel.name }}
              </CardTitle>
              <CardDescription class="truncate">
                {{ organizationName(hotel.organizationId) }}
              </CardDescription>
            </div>
            <Badge :variant="hotel.isActive ? 'success' : 'secondary'">
              {{ hotel.isActive ? 'Active' : 'Inactive' }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex items-center gap-3">
            <span
              class="inline-block h-6 w-6 shrink-0 rounded-md border border-[#E5E5E7]"
              :style="{ backgroundColor: hotel.primaryColor || '#F5F5F7' }"
              :title="hotel.primaryColor || 'No primary color'"
            />
            <span class="text-sm text-[#86868B]">
              {{ hotel.primaryColor || 'No primary color' }}
            </span>
          </div>
          <p class="truncate text-sm text-[#1D1D1F]">
            {{ hotel.email || '—' }}
          </p>
        </CardContent>
        <CardFooter v-if="can('write', RESOURCE)" class="gap-2">
          <Button variant="outline" size="sm" @click="startEdit(hotel)">
            <PencilIcon />
            Edit
          </Button>
          <Button variant="outline" size="sm" @click="removeHotel(hotel)">
            <Trash2Icon />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>

    <Dialog v-model:open="isFormDialogOpen">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editId ? 'Edit Hotel' : 'New Hotel' }}</DialogTitle>
          <DialogDescription>
            {{ editId ? 'Update the property details below.' : 'Create a new hotel property.' }}
          </DialogDescription>
        </DialogHeader>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2 sm:col-span-2">
            <Label for="hotel-name">Name</Label>
            <Input id="hotel-name" v-model="formName" placeholder="Hotel name" />
          </div>

          <div class="space-y-2">
            <Label>Organization</Label>
            <Select v-model="formOrganizationId">
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="org in organizations" :key="org.id" :value="org.id">
                  {{ org.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Country</Label>
            <Select v-model="formCountryId">
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="country in countries" :key="country.id" :value="country.id">
                  {{ country.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Language</Label>
            <Select v-model="formLanguageId">
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="language in languages" :key="language.id" :value="language.id">
                  {{ language.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Timezone</Label>
            <Select v-model="formTimezoneId">
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="timezone in timezones" :key="timezone.id" :value="timezone.id">
                  {{ timezone.name }} ({{ timezone.utcOffset }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="hotel-phone">Phone</Label>
            <Input id="hotel-phone" v-model="formPhone" placeholder="+1 555 000 0000" />
          </div>

          <div class="space-y-2">
            <Label for="hotel-email">Email</Label>
            <Input id="hotel-email" v-model="formEmail" type="email" placeholder="hotel@example.com" />
          </div>

          <div class="space-y-2 sm:col-span-2">
            <Label for="hotel-address">Address</Label>
            <Textarea id="hotel-address" v-model="formAddress" placeholder="Street, city, postal code" />
          </div>

          <div class="space-y-2">
            <Label for="hotel-website">Website</Label>
            <Input id="hotel-website" v-model="formWebsite" placeholder="https://example.com" />
          </div>

          <div class="space-y-2">
            <Label for="hotel-logo">Logo URL</Label>
            <Input id="hotel-logo" v-model="formLogo" placeholder="https://example.com/logo.png" />
          </div>

          <div class="space-y-2">
            <Label for="hotel-primary">Primary Color</Label>
            <div class="flex items-center gap-2">
              <Input id="hotel-primary" v-model="formPrimaryColor" placeholder="#027BFF" />
              <span
                class="inline-block h-9 w-9 shrink-0 rounded-md border border-[#E5E5E7]"
                :style="{ backgroundColor: formPrimaryColor || '#F5F5F7' }"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="hotel-secondary">Secondary Color</Label>
            <div class="flex items-center gap-2">
              <Input id="hotel-secondary" v-model="formSecondaryColor" placeholder="#1D1D1F" />
              <span
                class="inline-block h-9 w-9 shrink-0 rounded-md border border-[#E5E5E7]"
                :style="{ backgroundColor: formSecondaryColor || '#F5F5F7' }"
              />
            </div>
          </div>

          <div class="flex items-center justify-between rounded-md border border-[#E5E5E7] px-3 py-2 sm:col-span-2">
            <div>
              <Label for="hotel-active">Active</Label>
              <p class="text-xs text-[#86868B]">
                Inactive hotels are hidden from end users.
              </p>
            </div>
            <Switch id="hotel-active" v-model:checked="formActive" />
          </div>
        </div>

        <Alert v-if="errorMessage" variant="destructive">
          <AlertTitle>Save failed</AlertTitle>
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" :disabled="isSaving" @click="isFormDialogOpen = false">
            Cancel
          </Button>
          <Button :disabled="isSaving || !formName" @click="save">
            {{ isSaving ? 'Saving...' : editId ? 'Save Changes' : 'Create Hotel' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
