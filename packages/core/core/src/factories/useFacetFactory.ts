import { Ref, computed } from '@nuxtjs/composition-api';
import { sharedRef, Logger, configureFactoryParams } from '../utils';
import { UseFacet, FacetSearchResult, AgnosticFacetSearchParams, Context, FactoryParams, UseFacetErrors, ComposableFunctionArgs } from '../types';

export interface UseFacetFactoryParams<SEARCH_DATA> extends FactoryParams {
  search: (context: Context, params?: ComposableFunctionArgs<FacetSearchResult<SEARCH_DATA>>) => Promise<SEARCH_DATA>;
}

const useFacetFactory = <SEARCH_DATA>(factoryParams: UseFacetFactoryParams<SEARCH_DATA>) => {

  const useFacet = (id?: string): UseFacet<SEARCH_DATA> => {
    const ssrKey = id || 'useFacet';
    const loading: Ref<boolean> = sharedRef(false, `${ssrKey}-loading`);
    const result: Ref<FacetSearchResult<SEARCH_DATA>> = sharedRef({ data: null, input: null }, `${ssrKey}-facets`);
    const _factoryParams = configureFactoryParams(factoryParams);
    const error: Ref<UseFacetErrors> = sharedRef({
      search: null
    }, `useFacet-error-${id}`);

    const search = async (params: ComposableFunctionArgs<AgnosticFacetSearchParams> = {}) => {
      Logger.debug(`useFacet/${ssrKey}/search`, params);

      const {
        customQuery,
        signal,
        ...searchParams
      } = params;

      result.value.input = searchParams;
      try {
        loading.value = true;
        result.value.data = await _factoryParams.search({
          ...result.value,
          customQuery,
          signal
        });
        error.value.search = null;
      } catch (err) {
        error.value.search = err;
        Logger.error(`useFacet/${ssrKey}/search`, err);
      } finally {
        loading.value = false;
      }
    };

    return {
      result: computed(() => result.value),
      loading: computed(() => loading.value),
      error: computed(() => error.value),
      search
    };
  };

  return useFacet;
};

export { useFacetFactory };
