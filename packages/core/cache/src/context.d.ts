import { CacheTag } from './types';

declare module '@absolute-web/vsf-core' {
  export interface Context {
    $vsfCache: {
      tagsSet: Set<CacheTag>
    }
  }
}
