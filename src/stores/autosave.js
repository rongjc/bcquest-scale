import * as mobx from 'mobx';
import storage from 'store2';

export default function autosave(store, storageKey, deserialize = x => x) {
  let firstRun = true;

  mobx.autorun(() => {
    if (firstRun) {
      const existingStore = storage.get(storageKey);
      if (existingStore) {
        //mobx.extendObservable(store, deserialize(existingStore), {});
        mobx.set(store, deserialize(existingStore));
      }

      firstRun = false;
    }

    storage.set(storageKey, mobx.toJS(store));
  });
}
