<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { WifiIcon } from '@lucide/vue'
import { useAdminApi } from '~/composables/useAdminApi'

const adminApi = useAdminApi()

const wifiSsid = ref('')
const wifiPassword = ref('')
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

async function loadWifi() {
  isLoading.value = true
  try {
    const [masterSetups, hotelSetups] = await Promise.all([adminApi.listMasterSetups(), adminApi.listHotelSetups()])
    setupIdByCode.value = Object.fromEntries(masterSetups.map((item) => [item.setupCode, item.id]))

    const passwordSetupId = setupIdByCode.value.WIFI_PASSWORD
    const ssidSetupId = setupIdByCode.value.WIFI_SSID

    wifiPassword.value = hotelSetups.find((item) => item.setupId === passwordSetupId)?.value ?? 'guest-password'
    wifiSsid.value = hotelSetups.find((item) => item.setupId === ssidSetupId)?.value ?? 'SENTEC_GUEST'
  }
  finally {
    isLoading.value = false
  }
}

async function saveWifi() {
  if (isSaving.value) {
    return
  }

  isSaving.value = true
  try {
    await Promise.all([
      adminApi.upsertHotelSetup({ setupId: requiredSetupId('WIFI_SSID'), value: wifiSsid.value }),
      adminApi.upsertHotelSetup({ setupId: requiredSetupId('WIFI_PASSWORD'), value: wifiPassword.value }),
    ])
  }
  finally {
    isSaving.value = false
  }
}

onMounted(loadWifi)
</script>

<template>
  <div class="max-w-2xl space-y-8">
    <section>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Network Configuration</h3>
      <Card>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label>SSID (Network Name)</Label>
            <Input
              v-model="wifiSsid"
              type="text"
            />
          </div>
          <div class="space-y-2">
            <Label>Password</Label>
            <Input
              v-model="wifiPassword"
              type="text"
            />
          </div>
        </CardContent>
        <CardFooter class="border-t border-[#E5E5E7]">
          <Button size="sm" :disabled="isSaving || isLoading" @click="saveWifi">
            {{ isLoading ? 'Loading...' : isSaving ? 'Saving...' : 'Save WiFi Settings' }}
          </Button>
        </CardFooter>
      </Card>
    </section>

    <section>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Card Preview</h3>
      <Card class="mx-auto max-w-sm text-center">
        <CardHeader class="items-center text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F7]">
            <WifiIcon />
          </div>
          <CardTitle>{{ wifiSsid }}</CardTitle>
          <CardDescription>High-speed guest network</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center justify-between rounded-lg bg-[#F5F5F7] p-3">
            <code class="font-mono text-sm">{{ wifiPassword }}</code>
            <span class="text-[10px] font-bold uppercase text-[#007AFF]">Copy</span>
          </div>
        </CardContent>
        <CardFooter class="[&>button]:w-full">
          <Button size="sm">
            Connect Automatically
          </Button>
        </CardFooter>
      </Card>
    </section>
  </div>
</template>
