<script setup lang="ts">
import { ref } from 'vue'

const syncItems = [
  { label: 'Guest Profiles', count: '1,240', status: 'Synced' },
  { label: 'Room Inventory', count: '250', status: 'Synced' },
  { label: 'Reservations', count: '48', status: 'Syncing...' },
]

const pmsProvider = ref('Opera Cloud')
</script>

<template>
  <div class="max-w-2xl space-y-8">
    <section>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Connection Settings</h3>
      <Card>
        <CardContent>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="md:col-span-2">
            <div class="space-y-2">
              <Label>PMS Provider</Label>
              <Select v-model="pmsProvider">
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Opera Cloud">Opera Cloud</SelectItem>
                  <SelectItem value="Mews">Mews</SelectItem>
                  <SelectItem value="Cloudbeds">Cloudbeds</SelectItem>
                  <SelectItem value="Custom API">Custom API</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label>Hotel ID</Label>
            <Input
              type="text"
              placeholder="e.g. GS-LON-01"
            />
          </div>
          <div class="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              value="••••••••••••••••"
            />
          </div>
          </div>
        </CardContent>

        <CardFooter class="flex flex-col items-center justify-between gap-4 border-t border-[#E5E5E7] sm:flex-row">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-success" />
            <span class="text-sm font-bold text-success">Connected & Synced</span>
          </div>
          <div class="w-full sm:w-auto">
            <Button size="sm">
              Test Connection
            </Button>
          </div>
        </CardFooter>
      </Card>
    </section>

    <section>
      <h3 class="mb-4 text-sm font-bold uppercase tracking-widest text-[#86868B]">Sync Status</h3>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card v-for="item in syncItems" :key="item.label">
          <CardHeader class="gap-0 pb-0">
            <CardDescription class="text-[10px] font-bold uppercase tracking-widest text-[#86868B]">{{ item.label }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <p class="text-xl font-bold">{{ item.count }}</p>
            <Badge :variant="item.status === 'Synced' ? 'success' : 'secondary'">{{ item.status }}</Badge>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>
