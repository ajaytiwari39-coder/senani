<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { Building2, ShieldCheck, Lock } from '@lucide/vue';
import { home } from '@/routes';

defineProps<{
    title?: string;
    description?: string;
}>();
</script>

<template>
    <div class="relative flex min-h-dvh w-full flex-col items-center justify-center bg-[#F8F9FD] px-4 py-8 sm:py-12 text-[#18181B] selection:bg-[#673DE6] selection:text-white sm:px-6 lg:px-8">
        <!-- Ambient decorative background glow -->
        <div class="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#673DE6]/5 blur-[120px]"></div>
        <div class="pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[100px]"></div>

        <div class="w-full max-w-md">
            <!-- Branding Header -->
            <div class="mb-8 text-center">
                <Link :href="home()" class="inline-flex flex-col items-center gap-2 group">
                    <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#673DE6] to-[#5025d1] text-white shadow-xl shadow-[#673DE6]/25 group-hover:scale-105 transition-transform duration-200">
                        <Building2 class="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <div class="mt-2">
                        <div class="text-2xl font-extrabold tracking-tight text-slate-900">SENANI</div>
                        <p class="text-[11px] font-semibold tracking-wider text-[#673DE6] uppercase">Hospitality & Banquet ERP</p>
                    </div>
                </Link>

                <div class="mt-4">
                    <div class="inline-flex items-center gap-1.5 rounded-full border border-purple-200/80 bg-purple-50/80 px-3 py-1 text-[11px] font-semibold text-[#673DE6]">
                        <ShieldCheck class="h-3.5 w-3.5 text-[#673DE6]" />
                        High-Security Admin Gatekeeper
                    </div>
                    <h1 v-if="title" class="mt-3 text-lg font-bold tracking-tight text-slate-900">{{ title }}</h1>
                    <p v-if="description" class="mt-1 text-xs text-slate-500 font-normal">{{ description }}</p>
                </div>
            </div>

            <!-- Main Auth Card -->
            <div class="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.05)] ring-1 ring-slate-950/5">
                <slot />
            </div>

            <!-- Footer Security Badges -->
            <div class="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
                <span class="flex items-center gap-1">
                    <Lock class="h-3 w-3 text-[#673DE6]" /> 256-Bit SSL
                </span>
                <span>•</span>
                <span>Rate-Limit Guard</span>
                <span>•</span>
                <span>Encrypted Sessions</span>
            </div>
        </div>
    </div>
</template>
