import { defineNuxtRouteMiddleware } from '#app';
import { type RouteLocationNormalized } from 'vue-router';

interface PageTransition {
  name?: string;
  mode?: 'in-out' | 'out-in' | 'default'; 
}

interface PageMeta {
  order?: number;
  pageTransition?: PageTransition;
  disableTransition?: boolean;
}

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const fromMeta = from.meta as PageMeta || {};
  const toMeta = to.meta as PageMeta || {};
  
  if (toMeta.disableTransition) {
    return; 
  }

  to.meta.pageTransition = {
    name: 'page',
    mode: 'out-in', 
  };

  from.meta.pageTransition = fromMeta.pageTransition || {
    name: 'page',
    mode: 'out-in',
  };
});