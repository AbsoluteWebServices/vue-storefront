
import { configureContext } from '@absolute-web/vsf-core'
import { useNuxtApp } from '#app';

const contextPlugin = (ctx, inject) => {
  const sharedMap = new Map();

  const useVSFContext = () => {
    const { nuxt2Context: { $vsf, ...context } } = useNuxtApp();

    return { $vsf, ...context, ...$vsf }
  }

  configureContext({ useVSFContext, useNuxtApp });
  inject('sharedRefsMap', sharedMap)
};

export default contextPlugin;
