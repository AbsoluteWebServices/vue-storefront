
import { Ref } from '@vue/composition-api';
import { vsfRef } from '../../utils';

function sharedRef<T>(value: T, key: string): Ref;
function sharedRef(key: string, _?): Ref;

function sharedRef<T>(value: T, key: string): Ref {
  const givenKey = key || value;

  return vsfRef(
    key ? value : null,
    givenKey as string
  );
}

export { sharedRef };
