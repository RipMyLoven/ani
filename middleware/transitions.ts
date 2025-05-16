import { defineNuxtRouteMiddleware } from '#app';
import { type RouteLocationNormalized } from 'vue-router';

interface PageTransition {
  name?: string;
  mode?: string;
}

interface PageMeta {
  order?: number;
  pageTransition?: PageTransition;
  disableTransition?: boolean;
}

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const fromMeta = from.meta as PageMeta || {};
  const toMeta = to.meta as PageMeta || {};

  const isClient = typeof window !== 'undefined';
  const isLargeScreen = isClient ? window.innerWidth > 1024 : false;

  if (isLargeScreen) {
    fromMeta.pageTransition = {
      name: 'fade',
      mode: 'out-in',
    };
    toMeta.pageTransition = {
      name: 'fade',
      mode: 'out-in',
    };
    return;
  }

  const isSettingsRoute = (path: string) => /^\/settings\//.test(path);
  const disableTransition = toMeta.disableTransition || fromMeta.disableTransition;
  if (disableTransition) {
    return;
  }

  if (isSettingsRoute(from.fullPath) && !isSettingsRoute(to.fullPath)) {
    fromMeta.pageTransition = {
      name: 'slide-down',
      mode: 'out-in',
    };
    toMeta.pageTransition = {
      name: 'slide-down',
      mode: 'out-in',
    };
  } else if (!isSettingsRoute(from.fullPath) && isSettingsRoute(to.fullPath)) {
    fromMeta.pageTransition = {
      name: 'slide-up',
      mode: 'out-in',
    };
    toMeta.pageTransition = {
      name: 'slide-up',
      mode: 'out-in',
    };
  } else if (isSettingsRoute(from.fullPath) && isSettingsRoute(to.fullPath)) {
    if (toMeta.order !== undefined && fromMeta.order !== undefined) {
      if (toMeta.order > fromMeta.order) {
        fromMeta.pageTransition = {
          name: 'slide-left',
          mode: 'out-in',
        };
        toMeta.pageTransition = {
          name: 'slide-left',
          mode: 'out-in',
        };
      } else if (toMeta.order < fromMeta.order) {
        fromMeta.pageTransition = {
          name: 'slide-right',
          mode: 'out-in',
        };
        toMeta.pageTransition = {
          name: 'slide-right',
          mode: 'out-in',
        };
      }
    }
  } else {
    if (toMeta.order !== undefined && fromMeta.order !== undefined) {
      if (toMeta.order > fromMeta.order) {
        fromMeta.pageTransition = {
          name: 'slide-left',
          mode: 'out-in',
        };
        toMeta.pageTransition = {
          name: 'slide-left',
          mode: 'out-in',
        };
      } else if (toMeta.order < fromMeta.order) {
        fromMeta.pageTransition = {
          name: 'slide-right',
          mode: 'out-in',
        };
        toMeta.pageTransition = {
          name: 'slide-right',
          mode: 'out-in',
        };
      }
    }
  }
});