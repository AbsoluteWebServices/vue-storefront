import { Context } from './../../types';
interface ContextConfiguration {
  useVSFContext: () => Context;
  useNuxtApp: () => any;
}

let useVSFContext = () => ({}) as Context;
let useNuxtApp = () => ({}) as any;

const configureContext = (config: ContextConfiguration) => {
  useVSFContext = config.useVSFContext || useVSFContext;
  useNuxtApp = config.useNuxtApp || useNuxtApp;
};

const generateContext = (factoryParams) => {
  const vsfContext = useVSFContext();

  if (factoryParams.provide) {
    return { ...vsfContext.$vsf, ...factoryParams.provide(vsfContext.$vsf) };
  }

  return vsfContext.$vsf;
};

export {
  generateContext,
  useVSFContext,
  useNuxtApp,
  configureContext
};
