<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAdminApi } from '~/composables/useAdminApi'

const adminApi = useAdminApi()

const hotelName = ref('')
const logoUrl = ref('https://api.dicebear.com/7.x/initials/svg?seed=GS&backgroundColor=1d1d1f')
const primaryColor = ref('#027BFF')
const accentColor = ref('#FF1493')
const fontFamily = ref('Quicksand, sans-serif')

const isLoading = ref(false)
const isSaving = ref(false)

const setupIdByCode = ref<Record<string, string>>({})

function requiredSetupId(code: string) {
  const id = setupIdByCode.value[code]
  if (!id) {
    throw new Error(`Missing setup code: ${code}`)
  }

  return id
}

function findSetupValue(code: string, setups: Awaited<ReturnType<typeof adminApi.listHotelSetups>>) {
  const setupId = setupIdByCode.value[code]
  return setups.find((item) => item.setupId === setupId)?.value
}

async function loadBranding() {
  isLoading.value = true
  try {
    const [masterSetups, hotelSetups] = await Promise.all([adminApi.listMasterSetups(), adminApi.listHotelSetups()])
    setupIdByCode.value = Object.fromEntries(masterSetups.map((item) => [item.setupCode, item.id]))

    hotelName.value = findSetupValue('HOTEL_NAME', hotelSetups) ?? 'Aston Simatupang'
    logoUrl.value = findSetupValue('HOTEL_LOGO_URL', hotelSetups) ?? logoUrl.value
    primaryColor.value = findSetupValue('PRIMARY_COLOR', hotelSetups) ?? primaryColor.value
    accentColor.value = findSetupValue('SECONDARY_COLOR', hotelSetups) ?? accentColor.value
    fontFamily.value = findSetupValue('FONT_FAMILY', hotelSetups) ?? fontFamily.value
  }
  finally {
    isLoading.value = false
  }
}

async function saveBranding() {
  if (isSaving.value) {
    return
  }

  isSaving.value = true
  try {
    await Promise.all([
      adminApi.upsertHotelSetup({ setupId: requiredSetupId('HOTEL_NAME'), value: hotelName.value }),
      adminApi.upsertHotelSetup({ setupId: requiredSetupId('HOTEL_LOGO_URL'), value: logoUrl.value }),
      adminApi.upsertHotelSetup({ setupId: requiredSetupId('PRIMARY_COLOR'), value: primaryColor.value }),
      adminApi.upsertHotelSetup({ setupId: requiredSetupId('SECONDARY_COLOR'), value: accentColor.value }),
      adminApi.upsertHotelSetup({ setupId: requiredSetupId('FONT_FAMILY'), value: fontFamily.value }),
    ])
  }
  finally {
    isSaving.value = false
  }
}

onMounted(loadBranding)
</script>

<template>
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
    <div class="order-2 space-y-8 lg:order-1">
      <section>
        <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Identity</h3>
        <div class="space-y-6">
          <div class="space-y-2">
            <Label>Hotel Name</Label>
            <Input
              v-model="hotelName"
              type="text"
            />
          </div>
          <div class="space-y-2">
            <Label>Hotel Logo</Label>
            <div class="flex items-center gap-4">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E5E7] bg-white">
                <img :src="logoUrl" alt="Logo" class="max-h-full max-w-full">
              </div>
              <Input v-model="logoUrl" type="text" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Colors</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Primary Color</Label>
            <div class="flex items-center gap-3 rounded-xl border border-[#E5E5E7] bg-white p-2">
              <div class="h-8 w-8 shrink-0 rounded-lg shadow-inner" :style="{ backgroundColor: primaryColor }" />
              <Input v-model="primaryColor" type="text" class="h-8 border-0 px-1 py-0 font-mono text-xs uppercase shadow-none" />
            </div>
          </div>
          <div class="space-y-2">
            <Label>Accent Color</Label>
            <div class="flex items-center gap-3 rounded-xl border border-[#E5E5E7] bg-white p-2">
              <div class="h-8 w-8 shrink-0 rounded-lg shadow-inner" :style="{ backgroundColor: accentColor }" />
              <Input v-model="accentColor" type="text" class="h-8 border-0 px-1 py-0 font-mono text-xs uppercase shadow-none" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Typography</h3>
        <div class="space-y-2">
          <Label>Font Family</Label>
          <Select v-model="fontFamily">
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Quicksand, sans-serif">Quicksand</SelectItem>
              <SelectItem value='"Playfair Display", serif'>Playfair Display</SelectItem>
              <SelectItem value='"Space Grotesk", sans-serif'>Space Grotesk</SelectItem>
              <SelectItem value='"JetBrains Mono", monospace'>JetBrains Mono</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <div class="pt-8 [&>button]:w-full">
        <Button size="lg" :disabled="isSaving || isLoading" @click="saveBranding">
          {{ isLoading ? 'Loading...' : isSaving ? 'Saving...' : 'Save Branding Changes' }}
        </Button>
      </div>
    </div>

    <div class="order-1 space-y-4 lg:order-2">
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Live Preview</h3>
      <Card class="relative mx-auto aspect-9/16 max-w-70 overflow-hidden rounded-[40px] border-8 border-[#1D1D1F] shadow-2xl sm:max-w-75 py-0">
        <CardContent class="relative h-full px-0">
          <div class="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#1D1D1F]" />
          <div class="flex h-full flex-col bg-[#FBFBFD] p-4" :style="{ fontFamily }">
            <header class="mb-6 flex items-center justify-between pt-4">
              <img :src="logoUrl" alt="Logo" class="h-4 w-auto rounded">
              <div class="h-4 w-4 rounded-full bg-[#E5E5E7]" />
            </header>
            <div class="mb-6">
              <h4 class="text-lg font-bold leading-tight">Welcome, Nikolas</h4>
              <p class="text-[10px] font-medium text-[#86868B]">Room 402 • Mar 01 - Mar 05</p>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="cell in 4" :key="cell" class="aspect-square rounded-xl border border-[#E5E5E7] bg-white p-2">
                <div class="mb-2 h-6 w-6 rounded-lg bg-[#F5F5F7]" />
                <div class="h-1.5 w-10 rounded-full bg-[#F5F5F7]" />
              </div>
            </div>
            <div class="mt-auto pb-4">
              <div class="h-10 w-full rounded-full" :style="{ backgroundColor: primaryColor }" />
            </div>
          </div>
        </CardContent>
      </Card>
      <p class="text-center text-xs text-[#86868B]">Mobile Guest View Preview</p>
    </div>
  </div>
</template>
