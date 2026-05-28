<script setup lang="ts">
import { BellIcon } from '@lucide/vue'

const { services, toggleService } = useAdminConfig()
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Active Services</h3>
      <Button size="sm">Add New Service</Button>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card
        v-for="service in services"
        :key="service.id"
      >
        <CardContent class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-[#F5F5F7] p-2">
              <BellIcon />
            </div>
            <div>
              <h4 class="text-sm font-semibold">{{ service.name }}</h4>
              <p class="text-[10px] uppercase tracking-wider text-[#86868B]">{{ service.category }}</p>
            </div>
          </div>
          <Switch
            :checked="service.active"
            @update:checked="() => toggleService(service.id)"
          />
        </CardContent>
      </Card>
    </div>
  </div>
</template>
