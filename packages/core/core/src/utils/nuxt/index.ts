import { createExtendIntegrationInCtx, createAddIntegrationToCtx } from './context';
import { getIntegrationConfig, createProxiedApi, createProxiedGetApi } from './_proxyUtils';
import { Context as NuxtContext, Plugin as NuxtPlugin } from '@nuxt/types';
import { $fetch } from 'ohmyfetch';

const createClient = (nuxtCtx: NuxtContext, config) => ({
  async get(url, options) {
    try {
      const data = await $fetch(url, {
        method: 'GET',
        ...config,
        ...options,
        async onResponse({ response }) {
          if (process.server &&
            !nuxtCtx.res.headersSent &&
            process.env.HTTP_PROPAGATE_STALE_HEADER_STATUS_CODE &&
            process.env.HTTP_STALE_HEADER_NAME &&
            response.status === parseInt(process.env.HTTP_PROPAGATE_STALE_HEADER_STATUS_CODE)) {
            nuxtCtx.res.setHeader(process.env.HTTP_STALE_HEADER_NAME, 1);
          }
        }
      });
      return { data };
    } catch (err) {
      if (err.data) {
        throw err.data;
      }
      throw err;
    }
  },
  async post(url, body, options) {
    try {
      const data = await $fetch(url, {
        method: 'POST',
        ...config,
        ...options,
        body,
        async onResponse({ response }) {
          if (process.server &&
            !nuxtCtx.res.headersSent &&
            process.env.HTTP_PROPAGATE_STALE_HEADER_STATUS_CODE &&
            process.env.HTTP_STALE_HEADER_NAME &&
            response.status === parseInt(process.env.HTTP_PROPAGATE_STALE_HEADER_STATUS_CODE)) {
            nuxtCtx.res.setHeader(process.env.HTTP_STALE_HEADER_NAME, 1);
          }
        }
      });
      return { data };
    } catch (err) {
      if (err.data) {
        throw err.data;
      }
      throw err;
    }
  }
});

type InjectFn = (key: string, value: any) => void;
export type IntegrationPlugin = (pluginFn: NuxtPlugin) => NuxtPlugin

const parseCookies = (cookieString: string): Record<string, string> =>
  cookieString
    .split(';')
    .filter(String)
    .map(item => item.split('=').map(part => part.trim()))
    .reduce((obj, [name, value]) => ({ ...obj, [name]: value }), {});

const setCookieValues = (cookieValues: Record<string, string>, cookieString = '') => {
  const parsed = parseCookies(cookieString);

  Object.entries(cookieValues).forEach(([name, value]) => parsed[name] = value);

  return Object.entries(parsed).map(([name, value]) => `${name}=${value}`).join('; ');
};

export const integrationPlugin = (pluginFn: NuxtPlugin) => (nuxtCtx: NuxtContext, inject: InjectFn) => {
  const configure = (tag, configuration) => {
    const injectInContext = createAddIntegrationToCtx({ tag, nuxtCtx, inject });
    const config = getIntegrationConfig(nuxtCtx, configuration);
    const { middlewareUrl, ssrMiddlewareUrl } = (nuxtCtx as any).$config;

    if (middlewareUrl) {
      config.axios.baseURL = process.server ? ssrMiddlewareUrl || middlewareUrl : middlewareUrl;
    }

    if (nuxtCtx.app.i18n.cookieValues) {
      config.axios.headers.cookie = setCookieValues(nuxtCtx.app.i18n.cookieValues, config.axios.headers.cookie);
    }

    const client = createClient(nuxtCtx, config.axios);
    const api = createProxiedApi({ givenApi: configuration.api || {}, client, tag });
    const getApi = createProxiedGetApi({ givenApi: configuration.api || {}, client, tag });

    injectInContext({ api, getApi, client, config });
  };

  const extend = (tag, integrationProperties) => {
    createExtendIntegrationInCtx({ tag, nuxtCtx, inject })(integrationProperties);
  };

  const integration = { configure, extend };

  pluginFn({ ...nuxtCtx, integration } as NuxtContext, inject);
};
