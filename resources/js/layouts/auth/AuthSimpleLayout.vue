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
    <div class="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 text-slate-100 selection:bg-amber-500 selection:text-slate-950 sm:px-6 lg:px-8">
        <!-- Ambient decorative background glow -->
        <div class="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]"></div>
        <div class="pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-[100px]"></div>

        <div class="w-full max-w-md">
            <!-- Branding Header -->
            <div class="mb-8 text-center">
                <Link :href="home()" class="inline-flex flex-col items-center gap-2 group">
                    <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                        <Building2 class="h-7 w-7 stroke-[2.5]" />
                    </div>
                    <div class="mt-2">
                        <div class="text-2xl font-black tracking-wider text-white font-serif">SENANI</div>
                        <p class="text-[11px] font-medium tracking-widest text-amber-400 uppercase">Hospitality & Banquet ERP</p>
                    </div>
                </Link>

                <div class="mt-4">
                    <div class="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-0.5 text-[11px] font-medium text-slate-300">
                        <ShieldCheck class="h-3.5 w-3.5 text-emerald-400" />
                        High-Security Admin Gatekeeper
                    </div>
                    <h1 v-if="title" class="mt-3 text-lg font-bold tracking-tight text-white">{{ title }}</h1>
                    <p v-if="description" class="mt-1 text-xs text-slate-400">{{ description }}</p>
                </div>
            </div>

            <!-- Main Auth Card -->
            <div class="rounded-2xl border border-slate-800/90 bg-slate-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
                <slot />
            </div>

            <!-- Footer Security Badges -->
            <div class="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-500">
                <span class="flex items-center gap-1">
                    <Lock class="h-3 w-3 text-amber-400" /> 256-Bit SSL
                </span>
                <span>•</span>
                <span>Rate-Limit Guard</span>
                <span>•</span>
                <span>Encrypted Sessions</span>
            </div>
        </div>
    </div>
</template>
