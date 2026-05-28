<script setup lang="ts">
import { WifiIcon } from '@lucide/vue'

const { config, updateConfig } = useAdminConfig()
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
              :model-value="config.wifiSsid"
              type="text"
              @update:model-value="(value) => updateConfig({ wifiSsid: String(value) })"
            />
          </div>
          <div class="space-y-2">
            <Label>Password</Label>
            <Input
              :model-value="config.wifiPassword"
              type="text"
              @update:model-value="(value) => updateConfig({ wifiPassword: String(value) })"
            />
          </div>
        </CardContent>
      </Card>
    </section>

    <section>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Card Preview</h3>
      <Card class="mx-auto max-w-sm text-center">
        <CardHeader class="items-center text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F7]">
            <WifiIcon />
          </div>
          <CardTitle>{{ config.wifiSsid }}</CardTitle>
          <CardDescription>High-speed guest network</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex items-center justify-between rounded-lg bg-[#F5F5F7] p-3">
            <code class="font-mono text-sm">{{ config.wifiPassword }}</code>
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
