<script setup lang="ts">
import { UtensilsCrossedIcon } from '@lucide/vue'

const { outlets } = useAdminConfig()
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold uppercase tracking-widest text-[#86868B]">Hotel Outlets</h3>
      <Button size="sm">Add Outlet</Button>
    </div>

    <div class="space-y-3">
      <Card
        v-for="outlet in outlets"
        :key="outlet.id"
      >
        <CardContent class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="rounded-lg bg-[#F5F5F7] p-2">
              <UtensilsCrossedIcon />
            </div>
            <div>
              <h4 class="text-sm font-semibold">{{ outlet.name }}</h4>
              <p class="text-[10px] uppercase tracking-wider text-[#86868B]">{{ outlet.type }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Badge variant="success">{{ outlet.status }}</Badge>
            <Button variant="secondary" size="sm">Edit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
