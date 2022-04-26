import { IncomingMessage } from 'connect';
import { Context as NuxtContext } from '@nuxt/types';
import merge from 'lodash/merge';
import { ApiClientMethod } from './../../types';

interface CreateProxiedApiParams {
  givenApi: Record<string, ApiClientMethod>;
  client: any;
  tag: string;
}

export const getBaseUrl = (req: IncomingMessage) => {
  if (!req) return '/api/';
  const { headers } = req;
  const isHttps = require('is-https')(req);
  const scheme = isHttps ? 'https' : 'http';
  const host = headers['x-forwarded-host'] || headers.host;

  return `${scheme}://${host}/api/`;
};

export const createProxiedApi = ({ givenApi, client, tag }: CreateProxiedApiParams) => new Proxy(givenApi, {
  get: (target, prop, receiver) => {

    const functionName = String(prop);
    if (Reflect.has(target, functionName)) {
      return Reflect.get(target, prop, receiver);
    }

    return async (...args) => client
      .post(`/${tag}/${functionName}`, args)
      .then(r => r.data);
  }
});

export const createProxiedGetApi = ({ givenApi, client, tag }: CreateProxiedApiParams) => new Proxy(givenApi, {
  get: (target, prop, receiver) => {

    const functionName = String(prop);
    if (Reflect.has(target, functionName)) {
      return Reflect.get(target, prop, receiver);
    }

    return async (...args) => client
      .get(`/${tag}/${functionName}`, { params: { a: JSON.stringify(args) } })
      .then(r => r.data);
  }
});

export const getCookies = (context: NuxtContext) => context?.req?.headers?.cookie ?? '';

export const getRequestUrl = (req: IncomingMessage) => {
  if (!req) return null;
  const { headers } = req;
  const isHttps = require('is-https')(req);
  const scheme = isHttps ? 'https' : 'http';
  const host = headers['x-forwarded-host'] || headers.host;
  return `${scheme}://${host}${req.originalUrl}`;
};

const getRequestHeadersToForward = (req: IncomingMessage) => {
  let headers = {};

  if (process.env.SSR_API_FORWARD_HEADERS && req.headers) {
    const headersWhitelist = process.env.SSR_API_FORWARD_HEADERS.split(',').map(value => value?.toLowerCase().trim());

    if (headersWhitelist.length) {
      headers = Object.keys(req.headers).reduce((acc, key) => ({
        ...acc,
        ...(headersWhitelist.includes(key) ? { [key]: req.headers[key] } : {})
      }), headers);
    }
  }

  return headers;
};

export const getIntegrationConfig = (context: NuxtContext, configuration: any) => {
  const req = context?.req;
  const cookie = getCookies(context);
  const initialConfig = merge({
    axios: {
      baseURL: getBaseUrl(req),
      credentials: 'same-origin',
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(req ? {
          'X-Referrer': getRequestUrl(req),
          ...getRequestHeadersToForward(req)
        } : {})
      }
    }
  }, configuration);

  return initialConfig;
};
