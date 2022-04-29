import { Ref, unref, computed } from '@nuxtjs/composition-api';
import {
  ComposableFunctionArgs,
  UseUserShipping,
  Context,
  FactoryParams,
  UseUserShippingErrors,
  PlatformApi
} from '../types';
import { sharedRef, Logger, mask, configureFactoryParams } from '../utils';

export interface UseUserShippingFactoryParams<
  USER_SHIPPING,
  USER_SHIPPING_ITEM,
  API extends PlatformApi = any
> extends FactoryParams<API> {
  addAddress: (
    context: Context,
    params: ComposableFunctionArgs<{
      address: Readonly<USER_SHIPPING_ITEM>;
      shipping: Readonly<USER_SHIPPING>;
    }>) => Promise<USER_SHIPPING>;
  deleteAddress: (
    context: Context,
    params: ComposableFunctionArgs<{
      address: Readonly<USER_SHIPPING_ITEM>;
      shipping: Readonly<USER_SHIPPING>;
    }>) => Promise<USER_SHIPPING>;
  updateAddress: (
    context: Context,
    params: ComposableFunctionArgs<{
      address: Readonly<USER_SHIPPING_ITEM>;
      shipping: Readonly<USER_SHIPPING>;
    }>) => Promise<USER_SHIPPING>;
  load: (
    context: Context,
    params: ComposableFunctionArgs<{
      shipping: Readonly<USER_SHIPPING>;
    }>) => Promise<USER_SHIPPING>;
  setDefaultAddress: (
    context: Context,
    params: ComposableFunctionArgs<{
      address: Readonly<USER_SHIPPING_ITEM>;
      shipping: Readonly<USER_SHIPPING>;
    }>) => Promise<USER_SHIPPING>;
}

export const useUserShippingFactory = <USER_SHIPPING, USER_SHIPPING_ITEM, API extends PlatformApi = any>(
  factoryParams: UseUserShippingFactoryParams<USER_SHIPPING, USER_SHIPPING_ITEM, API>
) => {

  const useUserShipping = (): UseUserShipping<USER_SHIPPING, USER_SHIPPING_ITEM, API> => {
    const loading: Ref<boolean> = sharedRef(false, 'useUserShipping-loading');
    const shipping: Ref<USER_SHIPPING> = sharedRef(null, 'useUserShipping-shipping');
    const readonlyShipping: Readonly<USER_SHIPPING> = unref(shipping);
    const error: Ref<UseUserShippingErrors> = sharedRef({
      addAddress: null,
      deleteAddress: null,
      updateAddress: null,
      load: null,
      setDefaultAddress: null
    }, 'useUserShipping-error');

    const _factoryParams = configureFactoryParams(
      factoryParams,
      { mainRef: shipping, alias: 'currentShipping', loading, error }
    );

    const addAddress = async (params = {}) => {
      Logger.debug('useUserShipping.addAddress', mask(params));

      try {
        loading.value = true;
        shipping.value = await _factoryParams.addAddress({
          shipping: readonlyShipping,
          ...params
        });
        error.value.addAddress = null;
      } catch (err) {
        error.value.addAddress = err;
        Logger.error('useUserShipping/addAddress', err);
      } finally {
        loading.value = false;
      }
    };

    const deleteAddress = async (params = {}) => {
      Logger.debug('useUserShipping.deleteAddress', params);

      try {
        loading.value = true;
        shipping.value = await _factoryParams.deleteAddress({
          shipping: readonlyShipping,
          ...params
        });
        error.value.deleteAddress = null;
      } catch (err) {
        error.value.deleteAddress = err;
        Logger.error('useUserShipping/deleteAddress', err);
      } finally {
        loading.value = false;
      }
    };

    const updateAddress = async (params = {}) => {
      Logger.debug('useUserShipping.updateAddress', params);

      try {
        loading.value = true;
        shipping.value = await _factoryParams.updateAddress({
          shipping: readonlyShipping,
          ...params
        });
        error.value.updateAddress = null;
      } catch (err) {
        error.value.updateAddress = err;
        Logger.error('useUserShipping/updateAddress', err);
      } finally {
        loading.value = false;
      }
    };

    const load = async (params = {}) => {
      Logger.debug('useUserShipping.load');

      try {
        loading.value = true;
        shipping.value = await _factoryParams.load({
          shipping: readonlyShipping,
          ...params
        });
        error.value.load = null;
      } catch (err) {
        error.value.load = err;
        Logger.error('useUserShipping/load', err);
      } finally {
        loading.value = false;
      }
    };

    const setDefaultAddress = async (params) => {
      Logger.debug('useUserShipping.setDefaultAddress', params);

      try {
        loading.value = true;
        shipping.value = await _factoryParams.setDefaultAddress({
          shipping: readonlyShipping,
          ...params
        });
        error.value.setDefaultAddress = null;
      } catch (err) {
        error.value.setDefaultAddress = err;
        Logger.error('useUserShipping/setDefaultAddress', err);
      } finally {
        loading.value = false;
      }
    };

    return {
      api: _factoryParams.api,
      shipping: computed(() => shipping.value),
      loading: computed(() => loading.value),
      error: computed(() => error.value),
      addAddress,
      deleteAddress,
      updateAddress,
      load,
      setDefaultAddress
    };
  };

  return useUserShipping;
};
