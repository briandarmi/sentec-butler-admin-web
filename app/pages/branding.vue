<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { PaletteIcon, SaveIcon, CheckIcon, WifiIcon, BellIcon, UtensilsCrossedIcon, ConciergeBellIcon } from '@lucide/vue'
import { useAdminApi, type Hotel } from '~/composables/useAdminApi'
import { useAuthz } from '~/composables/useAuthz'
import { useAuth } from '~/composables/useAuth'

const adminApi = useAdminApi()
const { can } = useAuthz()
useAuth()

const hotel = ref<Hotel | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const savedMessage = ref('')
const errorMessage = ref('')

// ── form refs ───────────────────────────────────────────────────────────────
const name = ref('')
const logo = ref('')
const website = ref('')
const email = ref('')
const phone = ref('')
const address = ref('')
const primaryColor = ref('#027BFF')
const secondaryColor = ref('#1D1D1F')

function applyHotel(h: Hotel) {
  hotel.value = h
  name.value = h.name ?? ''
  logo.value = h.logo ?? ''
  website.value = h.website ?? ''
  email.value = h.email ?? ''
  phone.value = h.phone ?? ''
  address.value = h.address ?? ''
  primaryColor.value = h.primaryColor ?? '#027BFF'
  secondaryColor.value = h.secondaryColor ?? '#1D1D1F'
}

async function load() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const h = await adminApi.getCurrentHotel()
    applyHotel(h)
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isLoading.value = false
  }
}

async function save() {
  if (isSaving.value || !hotel.value) return
  isSaving.value = true
  savedMessage.value = ''
  errorMessage.value = ''
  try {
    const updated = await adminApi.upsertBranding({
      id: hotel.value.id,
      name: name.value,
      logo: logo.value,
      website: website.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
    })
    applyHotel(updated)
    savedMessage.value = 'Branding saved.'
  }
  catch (e) {
    errorMessage.value = String((e as Error).message)
  }
  finally {
    isSaving.value = false
  }
}

const hasLogo = computed(() => logo.value.trim().length > 0)
const previewName = computed(() => name.value.trim() || 'Hotel name')

onMounted(load)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">
          Branding
        </h3>
        <p class="text-sm text-[#86868B]">
          Customize how your hotel appears across the Sentec Butler experience.
        </p>
      </div>
      <Button
        v-if="can('write', 'branding')"
        size="sm"
        :disabled="isSaving || isLoading || !hotel"
        @click="save"
      >
        <SaveIcon />
        {{ isSaving ? 'Saving...' : 'Save' }}
      </Button>
    </div>

    <p v-if="isLoading" class="text-xs text-[#86868B]">
      Loading...
    </p>

    <!-- Alerts -->
    <Alert v-if="errorMessage" variant="destructive">
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>{{ errorMessage }}</AlertDescription>
    </Alert>
    <Alert v-else-if="savedMessage" variant="success">
      <CheckIcon />
      <AlertTitle>Saved</AlertTitle>
      <AlertDescription>{{ savedMessage }}</AlertDescription>
    </Alert>

    <!-- Two columns -->
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <!-- Left: form -->
      <Card class="rounded-xl">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-[#1D1D1F]">
            <PaletteIcon class="h-4 w-4 text-[#86868B]" />
            Identity
          </CardTitle>
          <CardDescription>Hotel details and brand colors.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="space-y-2">
            <Label for="brand-name">Name</Label>
            <Input id="brand-name" v-model="name" type="text" placeholder="Hotel name" />
          </div>

          <div class="space-y-2">
            <Label for="brand-logo">Logo URL</Label>
            <Input id="brand-logo" v-model="logo" type="text" placeholder="https://example.com/logo.png" />
          </div>

          <div class="space-y-2">
            <Label for="brand-website">Website</Label>
            <Input id="brand-website" v-model="website" type="text" placeholder="https://example.com" />
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="brand-email">Email</Label>
              <Input id="brand-email" v-model="email" type="text" placeholder="hello@example.com" />
            </div>
            <div class="space-y-2">
              <Label for="brand-phone">Phone</Label>
              <Input id="brand-phone" v-model="phone" type="text" placeholder="+1 555 000 0000" />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="brand-address">Address</Label>
            <Input id="brand-address" v-model="address" type="text" placeholder="Street, city, country" />
          </div>

          <Separator />

          <!-- Colors -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="brand-primary">Primary color</Label>
              <div class="flex items-center gap-2">
                <div
                  class="h-9 w-9 shrink-0 rounded-md border border-[#E5E5E7]"
                  :style="{ backgroundColor: primaryColor }"
                />
                <Input id="brand-primary" v-model="primaryColor" type="text" placeholder="#027BFF" />
                <input
                  v-model="primaryColor"
                  type="color"
                  class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-[#E5E5E7] bg-white p-0.5"
                  aria-label="Pick primary color"
                >
              </div>
            </div>

            <div class="space-y-2">
              <Label for="brand-secondary">Secondary color</Label>
              <div class="flex items-center gap-2">
                <div
                  class="h-9 w-9 shrink-0 rounded-md border border-[#E5E5E7]"
                  :style="{ backgroundColor: secondaryColor }"
                />
                <Input id="brand-secondary" v-model="secondaryColor" type="text" placeholder="#1D1D1F" />
                <input
                  v-model="secondaryColor"
                  type="color"
                  class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-[#E5E5E7] bg-white p-0.5"
                  aria-label="Pick secondary color"
                >
              </div>
            </div>
          </div>

          <p class="text-xs text-[#86868B]">
            Organization, country, language and timezone are managed by superadmin under Hotels.
          </p>
        </CardContent>
      </Card>

      <!-- Right: live preview (guest app on iPhone) -->
      <Card class="overflow-hidden rounded-xl">
        <CardHeader>
          <CardTitle class="text-[#1D1D1F]">
            Preview
          </CardTitle>
          <CardDescription>How your brand appears in the guest app.</CardDescription>
        </CardHeader>
        <CardContent class="flex justify-center bg-linear-to-b from-[#F5F5F7] to-[#E8E8EB] py-8">
          <!-- iPhone device -->
          <div class="relative w-72.5">
            <!-- side buttons -->
            <div class="absolute -left-0.75 top-24 h-8 w-0.75 rounded-l bg-[#0a0a0b]" />
            <div class="absolute -left-0.75 top-36 h-14 w-0.75 rounded-l bg-[#0a0a0b]" />
            <div class="absolute -left-0.75 top-52 h-14 w-0.75 rounded-l bg-[#0a0a0b]" />
            <div class="absolute -right-0.75 top-40 h-20 w-0.75 rounded-r bg-[#0a0a0b]" />

            <!-- frame -->
            <div class="relative rounded-[3rem] border-12 border-[#0a0a0b] bg-[#0a0a0b] shadow-2xl ring-1 ring-black/20">
              <div class="relative h-150 overflow-hidden rounded-[2.25rem] bg-white">
                <!-- Dynamic Island -->
                <div class="absolute left-1/2 top-2.5 z-30 h-6.5 w-24 -translate-x-1/2 rounded-full bg-black" />

                <!-- screen (scrolls) -->
                <div class="h-full overflow-y-auto">
                  <!-- branded header (extends under the status bar) -->
                  <div class="px-5 pb-5 pt-3 text-white" :style="{ backgroundColor: primaryColor }">
                    <!-- status bar -->
                    <div class="mb-7 flex items-center justify-between text-[11px] font-semibold">
                      <span>9:41</span>
                      <div class="flex items-center gap-1.5">
                        <span class="flex items-end gap-0.5">
                          <span class="h-1.5 w-0.75 rounded-sm bg-white/90" />
                          <span class="h-2 w-0.75 rounded-sm bg-white/90" />
                          <span class="h-2.5 w-0.75 rounded-sm bg-white/90" />
                          <span class="h-3 w-0.75 rounded-sm bg-white/90" />
                        </span>
                        <WifiIcon class="h-3.5 w-3.5" />
                        <span class="flex items-center">
                          <span class="relative flex h-3 w-6 items-center rounded-[3px] border border-white/80 px-[1.5px]">
                            <span class="h-1.5 w-full rounded-[1px] bg-white" />
                          </span>
                          <span class="ml-px h-1.5 w-0.5 rounded-r-sm bg-white/80" />
                        </span>
                      </div>
                    </div>

                    <!-- logo + name -->
                    <div class="flex items-center gap-3">
                      <div
                        v-if="hasLogo"
                        class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/90"
                      >
                        <img :src="logo" :alt="previewName" class="max-h-12 w-auto object-contain">
                      </div>
                      <div
                        v-else
                        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold"
                      >
                        {{ previewName.slice(0, 1) }}
                      </div>
                      <div class="min-w-0">
                        <p class="truncate text-base font-semibold">{{ previewName }}</p>
                        <p class="truncate text-[11px] text-white/80">{{ website || 'www.example.com' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- secondary accent -->
                  <div class="h-1 w-full" :style="{ backgroundColor: secondaryColor }" />

                  <!-- body -->
                  <div class="space-y-4 px-5 py-5">
                    <span
                      class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium text-white"
                      :style="{ backgroundColor: secondaryColor }"
                    >
                      Welcome
                    </span>
                    <p class="text-sm leading-relaxed text-[#1D1D1F]">
                      Enjoy a seamless stay at <span class="font-semibold">{{ previewName }}</span>.
                    </p>

                    <!-- quick actions -->
                    <div class="grid grid-cols-3 gap-2">
                      <div
                        v-for="action in [
                          { label: 'Dining', icon: UtensilsCrossedIcon },
                          { label: 'Housekeeping', icon: BellIcon },
                          { label: 'Concierge', icon: ConciergeBellIcon },
                        ]"
                        :key="action.label"
                        class="flex flex-col items-center gap-1.5 rounded-2xl bg-[#F5F5F7] px-2 py-3 text-center"
                      >
                        <span
                          class="flex h-9 w-9 items-center justify-center rounded-full"
                          :style="{ backgroundColor: primaryColor + '1A', color: primaryColor }"
                        >
                          <component :is="action.icon" class="h-4 w-4" />
                        </span>
                        <span class="text-[10px] font-medium text-[#1D1D1F]">{{ action.label }}</span>
                      </div>
                    </div>

                    <!-- contact -->
                    <div class="space-y-2 rounded-2xl bg-[#F5F5F7] p-4 text-xs text-[#86868B]">
                      <div v-if="email" class="flex justify-between gap-3">
                        <span class="font-medium text-[#1D1D1F]">Email</span>
                        <span class="truncate">{{ email }}</span>
                      </div>
                      <div v-if="phone" class="flex justify-between gap-3">
                        <span class="font-medium text-[#1D1D1F]">Phone</span>
                        <span class="truncate">{{ phone }}</span>
                      </div>
                      <div v-if="address" class="flex justify-between gap-3">
                        <span class="font-medium text-[#1D1D1F]">Address</span>
                        <span class="truncate text-right">{{ address }}</span>
                      </div>
                      <p v-if="!email && !phone && !address" class="text-center">
                        Add contact details to preview them here.
                      </p>
                    </div>

                    <button
                      type="button"
                      class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm"
                      :style="{ backgroundColor: primaryColor }"
                    >
                      Request service
                    </button>
                  </div>
                </div>

                <!-- home indicator -->
                <div class="pointer-events-none absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-[#1D1D1F]/30" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
