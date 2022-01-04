import { CacheTag, UseCache, SetTagsFn } from '..';
import { useContext } from '@nuxtjs/composition-api';

export const useCache = (): UseCache => {
  const { req }: any = useContext();

  if (!req) {
    return {
      addTags: () => {},
      clearTags: () => {},
      getTags: () => [],
      setTags: () => {},
      addTagsFromString: () => {}
    };
  }

  const $vsfCache = req.$vsfCache;
  const addTags = (tags: CacheTag[]) => tags.forEach(tag => $vsfCache.tagsSet.add(tag));
  const clearTags = () => $vsfCache.tagsSet.clear();
  const getTags = (): CacheTag[] => Array.from($vsfCache.tagsSet);
  const setTags = (fn: SetTagsFn) => {
    const tagsSet = $vsfCache.tagsSet;
    const newTags = fn(Array.from(tagsSet));
    tagsSet.clear();
    newTags.forEach(tag => tagsSet.add(tag));
  };
  const addTagsFromString = (tags: string) => {
    if (tags) {
      const parsedTags = tags.split(',').map((tag) => {
        const parts = tag.split('_');

        if (parts.length === 2) {
          return { prefix: `${parts[0]}_`, value: parts[1] };
        }
        if (parts.length === 3) {
          return { prefix: `${parts[0]}_${parts[1]}_`, value: parts[2] };
        }
        return { prefix: '', value: parts[0] };
      });

      addTags(parsedTags);
    }
  };

  return {
    addTags,
    clearTags,
    getTags,
    setTags,
    addTagsFromString
  };
};
