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

        if (parts.length > 1) {
          return { prefix: `${parts.slice(0, -1).join('_')}_`, value: parts[parts.length - 1] };
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
