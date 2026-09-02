import Dexie, { Table } from 'dexie';
import { NapBox, PendingMutation } from '../types';

export class GponOfflineDatabase extends Dexie {
  public cached_naps!: Table<NapBox, string>;
  public pending_mutations!: Table<PendingMutation, number>;

  constructor() {
    super('GponFttxOfflineDB');
    this.version(1).stores({
      cached_naps: 'id_nap, identificador, zona',
      pending_mutations: '++id, tipo, fechaCreacion'
    });
  }
}

export const offlineDb = new GponOfflineDatabase();

