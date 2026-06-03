<script setup lang="ts">
import { ref } from 'vue'
import { WandSparklesIcon } from '@lucide/vue'

definePageMeta({
  layout: false,
})

const auth = useAuth()

const username = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

function autofill(u: string, p: string) {
  username.value = u
  password.value = p
}

async function submitLogin() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    const result = await auth.login({
      username: username.value,
      password: password.value,
    })

    if (!result.ok) {
      errorMessage.value = result.message
      return
    }

    await navigateTo('/')
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[#F5F5F7] p-4 md:p-8">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(2,123,255,0.15),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(29,29,31,0.08),transparent_35%)]" />

    <div class="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl items-center justify-center md:min-h-[calc(100vh-4rem)]">
      <Card class="w-full max-w-md border-[#E5E5E7] bg-white/90 shadow-xl backdrop-blur">
        <CardHeader>
          <CardTitle class="text-2xl tracking-tight">Sentec Butler Admin</CardTitle>
          <CardDescription>Enter your credentials to sign in.</CardDescription>
        </CardHeader>

        <CardContent>
          <form class="space-y-5" @submit.prevent="submitLogin">
            <Input id="username" v-model="username" autocomplete="username" placeholder="Enter username" />

            <Input id="password" v-model="password" type="password" autocomplete="current-password" placeholder="Enter password" />

            <Alert v-if="errorMessage" variant="destructive">
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{{ errorMessage }}</AlertDescription>
            </Alert>

            <Button class="w-full" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <div class="w-full space-y-2 rounded-lg bg-[#F5F5F7] p-3">
            <p class="text-xs font-semibold text-[#4A4A4F]">Demo Credentials</p>
            <div class="flex gap-2">
              <Button type="button" variant="outline" size="sm" class="flex-1 text-xs" @click="autofill('admin', 'admin123')">
                <WandSparklesIcon class="h-3 w-3" />
                Admin
              </Button>
              <Button type="button" variant="outline" size="sm" class="flex-1 text-xs" @click="autofill('superadmin', 'superadmin123')">
                <WandSparklesIcon class="h-3 w-3" />
                Superadmin
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>