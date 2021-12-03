
import { Ref } from '@nuxtjs/composition-api';
import { vsfRef, useVSFContext } from '../../utils';

function sharedRef<T = any>(value: T, key: string): Ref<T>;
function sharedRef<T = any>(key: string, _?): Ref<T>;

function sharedRef<T>(value: T, key: string): Ref<T> {
  const { $sharedRefsMap } = useVSFContext() as any;
  const givenKey = key || value;

  if ($sharedRefsMap.has(givenKey)) {
    return $sharedRefsMap.get(givenKey);
  }

  const newRef = vsfRef<T>(
    key ? value : null,
    givenKey as string
  );

  $sharedRefsMap.set(givenKey, newRef);

  return newRef;
}

export { sharedRef };
