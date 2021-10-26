import { registerLogger } from '@absolute-web/vsf-core'

const loggerPlugin = (ctx) => {
  const { verbosity, customLogger, ...args } = <%= serialize(options) %>;
  registerLogger(customLogger || args, verbosity || 'error')
};

export default loggerPlugin;
