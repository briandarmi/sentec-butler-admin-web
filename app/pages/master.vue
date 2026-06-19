<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { PlusIcon, PencilIcon, ShieldAlertIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

useAuth()
const adminApi = useAdminApi()
const { can } = useAuthz()

const RESOURCE = 'master' as const

// ── shared state ────────────────────────────────────────────────────────────
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')

const countries = ref<Awaited<ReturnType<typeof adminApi.listCountries>>>([])
const languages = ref<Awaited<ReturnType<typeof adminApi.listLanguages>>>([])
const timezones = ref<Awaited<ReturnType<typeof adminApi.listTimezones>>>([])
const setups = ref<Awaited<ReturnType<typeof adminApi.listMasterSetupKeys>>>([])
const icons = ref<Awaited<ReturnType<typeof adminApi.listIcons>>>([])

async function loadAll() {
  if (!can('read', RESOURCE)) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    countries.value = await adminApi.listCountries()
    languages.value = await adminApi.listLanguages()
    setups.value = await adminApi.listMasterSetupKeys()
    timezones.value = await adminApi.listTimezones()
    icons.value = await adminApi.listIcons()
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isLoading.value = false
  }
}

// ── Countries ─────────────────────────────────────────────────────────────────
const isCountryDialogOpen = ref(false)
const countryEditId = ref<string | undefined>(undefined)
const countryName = ref('')
const countryCode = ref('')
const countryDemonym = ref('')

function resetCountryForm() {
  countryEditId.value = undefined
  countryName.value = ''
  countryCode.value = ''
  countryDemonym.value = ''
}
function openCreateCountry() {
  resetCountryForm()
  isCountryDialogOpen.value = true
}
function startEditCountry(row: (typeof countries.value)[number]) {
  countryEditId.value = row.id
  countryName.value = row.name
  countryCode.value = row.code
  countryDemonym.value = row.demonym ?? ''
  isCountryDialogOpen.value = true
}
async function saveCountry() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertCountry({
      id: countryEditId.value,
      name: countryName.value,
      code: countryCode.value,
      demonym: countryDemonym.value || null,
    })
    countries.value = await adminApi.listCountries()
    isCountryDialogOpen.value = false
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSaving.value = false
  }
}

// ── Languages ───────────────────────────────────────────────────────────────
const isLanguageDialogOpen = ref(false)
const languageEditId = ref<string | undefined>(undefined)
const languageName = ref('')
const languageCode = ref('')

function resetLanguageForm() {
  languageEditId.value = undefined
  languageName.value = ''
  languageCode.value = ''
}
function openCreateLanguage() {
  resetLanguageForm()
  isLanguageDialogOpen.value = true
}
function startEditLanguage(row: (typeof languages.value)[number]) {
  languageEditId.value = row.id
  languageName.value = row.name
  languageCode.value = row.code
  isLanguageDialogOpen.value = true
}
async function saveLanguage() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertLanguage({
      id: languageEditId.value,
      name: languageName.value,
      code: languageCode.value,
    })
    languages.value = await adminApi.listLanguages()
    isLanguageDialogOpen.value = false
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSaving.value = false
  }
}

// ── Timezones ──────────────────────────────────────────────────────────────
const isTimezoneDialogOpen = ref(false)
const timezoneEditId = ref<string | undefined>(undefined)
const timezoneName = ref('')
const timezoneUtcOffset = ref('')

function resetTimezoneForm() {
  timezoneEditId.value = undefined
  timezoneName.value = ''
  timezoneUtcOffset.value = ''
}
function openCreateTimezone() {
  resetTimezoneForm()
  isTimezoneDialogOpen.value = true
}
function startEditTimezone(row: (typeof timezones.value)[number]) {
  timezoneEditId.value = row.id
  timezoneName.value = row.name
  timezoneUtcOffset.value = row.utcOffset
  isTimezoneDialogOpen.value = true
}
async function saveTimezone() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertTimezone({
      id: timezoneEditId.value,
      name: timezoneName.value,
      utcOffset: timezoneUtcOffset.value,
    })
    timezones.value = await adminApi.listTimezones()
    isTimezoneDialogOpen.value = false
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSaving.value = false
  }
}

// ── Setups (master_setup) ────────────────────────────────────────────────────
const isSetupDialogOpen = ref(false)
const setupEditId = ref<string | undefined>(undefined)
const setupName = ref('')
const setupCode = ref('')
const setupInputType = ref('text')
const setupOptionValue = ref('')

function resetSetupForm() {
  setupEditId.value = undefined
  setupName.value = ''
  setupCode.value = ''
  setupInputType.value = 'text'
  setupOptionValue.value = ''
}
function openCreateSetup() {
  resetSetupForm()
  isSetupDialogOpen.value = true
}
function startEditSetup(row: (typeof setups.value)[number]) {
  setupEditId.value = row.id
  setupName.value = row.name
  setupCode.value = row.setupCode
  setupInputType.value = row.inputType
  setupOptionValue.value = row.optionValue ?? ''
  isSetupDialogOpen.value = true
}
async function saveSetup() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertMasterSetup({
      id: setupEditId.value,
      name: setupName.value,
      setupCode: setupCode.value,
      inputType: setupInputType.value,
      optionValue: setupOptionValue.value || null,
    })
    setups.value = await adminApi.listMasterSetupKeys()
    isSetupDialogOpen.value = false
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSaving.value = false
  }
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const isIconDialogOpen = ref(false)
const iconEditId = ref<string | undefined>(undefined)
const iconName = ref('')
const iconValue = ref('')

function resetIconForm() {
  iconEditId.value = undefined
  iconName.value = ''
  iconValue.value = ''
}
function openCreateIcon() {
  resetIconForm()
  isIconDialogOpen.value = true
}
function startEditIcon(row: (typeof icons.value)[number]) {
  iconEditId.value = row.id
  iconName.value = row.name
  iconValue.value = row.icon
  isIconDialogOpen.value = true
}
async function saveIcon() {
  if (isSaving.value) return
  isSaving.value = true
  errorMessage.value = ''
  try {
    await adminApi.upsertIcon({
      id: iconEditId.value,
      name: iconName.value,
      icon: iconValue.value,
    })
    icons.value = await adminApi.listIcons()
    isIconDialogOpen.value = false
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSaving.value = false
  }
}

onMounted(loadAll)
</script>

<template>
  <div v-if="!can('read', RESOURCE)" class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
      <ShieldAlertIcon class="text-[#C7C7CC]" />
    </div>
    <h3 class="mb-2 text-xl font-bold">Superadmin Access Only</h3>
    <p class="max-w-sm text-[#86868B]">This section is available only to superadmin users.</p>
  </div>

  <div v-else class="space-y-8">
    <div>
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Master Data</h3>
      <p class="mt-1 text-sm text-[#86868B]">Global reference data shared across all hotels.</p>
    </div>

    <p v-if="isLoading" class="text-xs text-[#86868B]">Loading...</p>

    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>

    <Tabs default-value="countries" class="space-y-6">
      <TabsList>
        <TabsTrigger value="countries">Countries</TabsTrigger>
        <TabsTrigger value="languages">Languages</TabsTrigger>
        <TabsTrigger value="timezones">Timezones</TabsTrigger>
        <TabsTrigger value="setups">Setups</TabsTrigger>
        <TabsTrigger value="icons">Icons</TabsTrigger>
      </TabsList>

      <!-- Countries -->
      <TabsContent value="countries">
        <Card class="rounded-xl">
          <CardHeader class="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Countries</CardTitle>
              <CardDescription>Country names, ISO codes, and demonyms.</CardDescription>
            </div>
            <Button v-if="can('write', RESOURCE)" size="sm" @click="openCreateCountry">
              <PlusIcon />
              New Country
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Demonym</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in countries" :key="row.id">
                  <TableCell class="font-medium text-[#1D1D1F]">{{ row.name }}</TableCell>
                  <TableCell><Badge variant="secondary">{{ row.code }}</Badge></TableCell>
                  <TableCell class="text-[#86868B]">{{ row.demonym ?? '—' }}</TableCell>
                  <TableCell class="text-right">
                    <Button v-if="can('write', RESOURCE)" size="sm" variant="ghost" @click="startEditCountry(row)">
                      <PencilIcon />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow v-if="!countries.length && !isLoading">
                  <TableCell colspan="4" class="text-center text-sm text-[#86868B]">No countries yet.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Languages -->
      <TabsContent value="languages">
        <Card class="rounded-xl">
          <CardHeader class="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Languages</CardTitle>
              <CardDescription>Supported languages and their codes.</CardDescription>
            </div>
            <Button v-if="can('write', RESOURCE)" size="sm" @click="openCreateLanguage">
              <PlusIcon />
              New Language
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in languages" :key="row.id">
                  <TableCell class="font-medium text-[#1D1D1F]">{{ row.name }}</TableCell>
                  <TableCell><Badge variant="secondary">{{ row.code }}</Badge></TableCell>
                  <TableCell class="text-right">
                    <Button v-if="can('write', RESOURCE)" size="sm" variant="ghost" @click="startEditLanguage(row)">
                      <PencilIcon />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow v-if="!languages.length && !isLoading">
                  <TableCell colspan="3" class="text-center text-sm text-[#86868B]">No languages yet.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Timezones -->
      <TabsContent value="timezones">
        <Card class="rounded-xl">
          <CardHeader class="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Timezones</CardTitle>
              <CardDescription>Timezone names with their UTC offsets.</CardDescription>
            </div>
            <Button v-if="can('write', RESOURCE)" size="sm" @click="openCreateTimezone">
              <PlusIcon />
              New Timezone
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>UTC Offset</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in timezones" :key="row.id">
                  <TableCell class="font-medium text-[#1D1D1F]">{{ row.name }}</TableCell>
                  <TableCell><Badge variant="secondary">{{ row.utcOffset }}</Badge></TableCell>
                  <TableCell class="text-right">
                    <Button v-if="can('write', RESOURCE)" size="sm" variant="ghost" @click="startEditTimezone(row)">
                      <PencilIcon />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow v-if="!timezones.length && !isLoading">
                  <TableCell colspan="3" class="text-center text-sm text-[#86868B]">No timezones yet.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Setups -->
      <TabsContent value="setups">
        <Card class="rounded-xl">
          <CardHeader class="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Setups</CardTitle>
              <CardDescription>Master setup keys consumed by per-hotel configuration.</CardDescription>
            </div>
            <Button v-if="can('write', RESOURCE)" size="sm" @click="openCreateSetup">
              <PlusIcon />
              New Setup
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Setup Code</TableHead>
                  <TableHead>Input Type</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in setups" :key="row.id">
                  <TableCell class="font-medium text-[#1D1D1F]">{{ row.name }}</TableCell>
                  <TableCell class="text-[#86868B]">{{ row.setupCode }}</TableCell>
                  <TableCell><Badge variant="outline">{{ row.inputType }}</Badge></TableCell>
                  <TableCell class="text-right">
                    <Button v-if="can('write', RESOURCE)" size="sm" variant="ghost" @click="startEditSetup(row)">
                      <PencilIcon />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow v-if="!setups.length && !isLoading">
                  <TableCell colspan="4" class="text-center text-sm text-[#86868B]">No setups yet.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Icons -->
      <TabsContent value="icons">
        <Card class="rounded-xl">
          <CardHeader class="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Icons</CardTitle>
              <CardDescription>Reusable icon glyphs referenced by categories and services.</CardDescription>
            </div>
            <Button v-if="can('write', RESOURCE)" size="sm" @click="openCreateIcon">
              <PlusIcon />
              New Icon
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="row in icons" :key="row.id">
                  <TableCell class="text-xl">{{ row.icon }}</TableCell>
                  <TableCell class="font-medium text-[#1D1D1F]">{{ row.name }}</TableCell>
                  <TableCell class="text-right">
                    <Button v-if="can('write', RESOURCE)" size="sm" variant="ghost" @click="startEditIcon(row)">
                      <PencilIcon />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow v-if="!icons.length && !isLoading">
                  <TableCell colspan="3" class="text-center text-sm text-[#86868B]">No icons yet.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- Country dialog -->
    <Dialog v-model:open="isCountryDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ countryEditId ? 'Edit Country' : 'New Country' }}</DialogTitle>
          <DialogDescription>Define the country name, ISO code, and demonym.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="country-name">Name</Label>
            <Input id="country-name" v-model="countryName" placeholder="Indonesia" />
          </div>
          <div class="space-y-2">
            <Label for="country-code">Code</Label>
            <Input id="country-code" v-model="countryCode" placeholder="ID" />
          </div>
          <div class="space-y-2">
            <Label for="country-demonym">Demonym</Label>
            <Input id="country-demonym" v-model="countryDemonym" placeholder="Indonesian" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isCountryDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving" @click="saveCountry">{{ isSaving ? 'Saving...' : 'Save' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Language dialog -->
    <Dialog v-model:open="isLanguageDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ languageEditId ? 'Edit Language' : 'New Language' }}</DialogTitle>
          <DialogDescription>Define the language name and code.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="language-name">Name</Label>
            <Input id="language-name" v-model="languageName" placeholder="English" />
          </div>
          <div class="space-y-2">
            <Label for="language-code">Code</Label>
            <Input id="language-code" v-model="languageCode" placeholder="en" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isLanguageDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving" @click="saveLanguage">{{ isSaving ? 'Saving...' : 'Save' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Timezone dialog -->
    <Dialog v-model:open="isTimezoneDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ timezoneEditId ? 'Edit Timezone' : 'New Timezone' }}</DialogTitle>
          <DialogDescription>Define the timezone name and UTC offset.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="timezone-name">Name</Label>
            <Input id="timezone-name" v-model="timezoneName" placeholder="Asia/Jakarta" />
          </div>
          <div class="space-y-2">
            <Label for="timezone-offset">UTC Offset</Label>
            <Input id="timezone-offset" v-model="timezoneUtcOffset" placeholder="+07:00" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isTimezoneDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving" @click="saveTimezone">{{ isSaving ? 'Saving...' : 'Save' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Setup dialog -->
    <Dialog v-model:open="isSetupDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ setupEditId ? 'Edit Setup' : 'New Setup' }}</DialogTitle>
          <DialogDescription>Define a master setup key and its input type.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="setup-name">Name</Label>
            <Input id="setup-name" v-model="setupName" placeholder="Check-out time" />
          </div>
          <div class="space-y-2">
            <Label for="setup-code">Setup Code</Label>
            <Input id="setup-code" v-model="setupCode" placeholder="checkout_time" />
          </div>
          <div class="space-y-2">
            <Label>Input Type</Label>
            <Select v-model="setupInputType">
              <SelectTrigger><SelectValue placeholder="Select input type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">text</SelectItem>
                <SelectItem value="number">number</SelectItem>
                <SelectItem value="option">option</SelectItem>
                <SelectItem value="date">date</SelectItem>
                <SelectItem value="time">time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="setup-option">Option Value</Label>
            <Input id="setup-option" v-model="setupOptionValue" placeholder="Comma-separated options (for 'option' type)" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isSetupDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving" @click="saveSetup">{{ isSaving ? 'Saving...' : 'Save' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Icon dialog -->
    <Dialog v-model:open="isIconDialogOpen">
      <DialogContent class="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{{ iconEditId ? 'Edit Icon' : 'New Icon' }}</DialogTitle>
          <DialogDescription>Define the icon name and glyph.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="icon-name">Name</Label>
            <Input id="icon-name" v-model="iconName" placeholder="Coffee" />
          </div>
          <div class="space-y-2">
            <Label for="icon-value">Icon</Label>
            <Input id="icon-value" v-model="iconValue" placeholder="☕ (emoji or short text)" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="isIconDialogOpen = false">Cancel</Button>
          <Button :disabled="isSaving" @click="saveIcon">{{ isSaving ? 'Saving...' : 'Save' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
