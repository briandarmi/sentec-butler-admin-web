<script setup lang="ts">
import { computed } from 'vue'
import { UploadIcon } from '@lucide/vue'

const { config, updateConfig } = useAdminConfig()

const hotelNameModel = computed({
  get: () => config.value.hotelName,
  set: (value: string | number) => updateConfig({ hotelName: String(value) }),
})

const fontFamilyModel = computed({
  get: () => config.value.fontFamily,
  set: (value: string | number) => updateConfig({ fontFamily: String(value) }),
})
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
              v-model="hotelNameModel"
              type="text"
            />
          </div>
          <div class="space-y-2">
            <Label>Hotel Logo</Label>
            <div class="flex items-center gap-4">
              <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E5E5E7] bg-white">
                <img :src="config.logoUrl" alt="Logo" class="max-h-full max-w-full">
              </div>
              <Button variant="secondary" size="sm">
                <UploadIcon/>
                Replace Logo
              </Button>
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
              <div class="h-8 w-8 shrink-0 rounded-lg shadow-inner" :style="{ backgroundColor: config.primaryColor }" />
              <span class="truncate font-mono text-xs uppercase">{{ config.primaryColor }}</span>
            </div>
          </div>
          <div class="space-y-2">
            <Label>Accent Color</Label>
            <div class="flex items-center gap-3 rounded-xl border border-[#E5E5E7] bg-white p-2">
              <div class="h-8 w-8 shrink-0 rounded-lg shadow-inner" :style="{ backgroundColor: config.accentColor }" />
              <span class="truncate font-mono text-xs uppercase">{{ config.accentColor }}</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Typography</h3>
        <div class="space-y-2">
          <Label>Font Family</Label>
          <Select
            v-model="fontFamilyModel"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif'>
                System Default (iPhone Style)
              </SelectItem>
              <SelectItem value='"Inter", sans-serif'>Inter</SelectItem>
              <SelectItem value='"Playfair Display", serif'>Playfair Display</SelectItem>
              <SelectItem value='"Space Grotesk", sans-serif'>Space Grotesk</SelectItem>
              <SelectItem value='"JetBrains Mono", monospace'>JetBrains Mono</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <div class="pt-8 [&>button]:w-full">
        <Button size="lg">
          Save Branding Changes
        </Button>
      </div>
    </div>

    <div class="order-1 space-y-4 lg:order-2">
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Live Preview</h3>
      <Card class="relative mx-auto aspect-9/16 max-w-70 overflow-hidden rounded-[40px] border-8 border-[#1D1D1F] shadow-2xl sm:max-w-75 py-0">
        <CardContent class="relative h-full px-0">
          <div class="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#1D1D1F]" />
          <div class="flex h-full flex-col bg-[#FBFBFD] p-4" :style="{ fontFamily: config.fontFamily }">
            <header class="mb-6 flex items-center justify-between pt-4">
              <img :src="config.logoUrl" alt="Logo" class="h-4 w-auto rounded">
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
              <div class="h-10 w-full rounded-full bg-[#027BFF]" />
            </div>
          </div>
        </CardContent>
      </Card>
      <p class="text-center text-xs text-[#86868B]">Mobile Guest View Preview</p>
    </div>
  </div>
</template>
