import { configureSSR } from '@absolute-web/vsf-core'
import { onServerPrefetch, getCurrentInstance } from '@vue/composition-api';
import { useState } from '#app';


const hasRouteChanged = (ctx) => {
  const { from } = ctx.$router.app.context;
  const { current } = ctx.$router.history

  if (!from) {
    return false
  }

  return from.fullPath !== current.fullPath
}

const ssrPlugin = () => {
  configureSSR({
    vsfRef: (value, key) => useState(key, value instanceof Function ? value : () => value),
    onSSR: (fn) => {
      onServerPrefetch(fn);
      if (typeof window !== 'undefined') {
        const vm = getCurrentInstance();

        if (hasRouteChanged(vm)) {
          fn();
        }
      }
    }
  });
};

export default ssrPlugin;
