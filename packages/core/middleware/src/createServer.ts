import express, { Request, Response, Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import consola from 'consola';
import { MiddlewareConfig, ApiClientExtension, CustomQuery } from '@absolute-web/vsf-core';
import { registerIntegrations } from './integrations';
import getAgnosticStatusCode from './helpers/getAgnosticStatusCode';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());

interface MiddlewareContext {
  req: Request;
  res: Response;
  extensions: ApiClientExtension[];
  customQueries: Record<string, CustomQuery>;
}

interface RequestParams {
  integrationName: string;
  functionName: string;
}

function createServer (config: MiddlewareConfig): Express {
  consola.info('Middleware starting....');
  consola.info('Loading integrations...');

  const integrations = registerIntegrations(app, config.integrations);

  consola.success('Integrations loaded!');

  app.get('/:integrationName/:functionName', async (req: Request, res: Response) => {
    const { integrationName, functionName } = req.params as any as RequestParams;
    const { apiClient, configuration, extensions, customQueries } = integrations[integrationName];
    const middlewareContext: MiddlewareContext = { req, res, extensions, customQueries };
    const createApiClient = apiClient.createApiClient.bind({ middleware: middlewareContext });
    const apiClientInstance = createApiClient(configuration);

    if (!Object.prototype.hasOwnProperty.call(apiClientInstance.getApi || {}, functionName)) {
      res.sendStatus(404);
      return;
    }

    const apiFunction = apiClientInstance.getApi[functionName];
    try {
      const { a: args } = req.query;
      const parsed = args ? JSON.parse(args as string) : [];
      const platformResponse = await apiFunction(...parsed);

      res.send(platformResponse);
    } catch (error) {
      res.status(getAgnosticStatusCode(error));
      res.send(error);
    }
  });

  app.post('/:integrationName/:functionName', async (req: Request, res: Response) => {
    const { integrationName, functionName } = req.params as any as RequestParams;
    const { apiClient, configuration, extensions, customQueries } = integrations[integrationName];
    const middlewareContext: MiddlewareContext = { req, res, extensions, customQueries };
    const createApiClient = apiClient.createApiClient.bind({ middleware: middlewareContext });
    const apiClientInstance = createApiClient(configuration);

    if (!Object.prototype.hasOwnProperty.call(apiClientInstance.api || {}, functionName)) {
      res.sendStatus(404);
      return;
    }

    const apiFunction = apiClientInstance.api[functionName];
    try {
      const platformResponse = await apiFunction(...req.body);

      res.send(platformResponse);
    } catch (error) {
      res.status(getAgnosticStatusCode(error));
      res.send(error);
    }
  });

  consola.success('Middleware created!');

  return app;
}

export { createServer };
