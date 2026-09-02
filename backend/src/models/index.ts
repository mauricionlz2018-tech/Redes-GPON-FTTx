import { sequelize } from '../config/database';
import { User } from './User';
import { OdfPanel } from './OdfPanel';
import { PonPort } from './PonPort';
import { FiberThread } from './FiberThread';
import { NapBox } from './NapBox';
import { NapPort } from './NapPort';
import { Client } from './Client';

// Relaciones ODF -> PON Ports
OdfPanel.hasMany(PonPort, { foreignKey: 'id_odf', as: 'puertos_pon', onDelete: 'CASCADE' });
PonPort.belongsTo(OdfPanel, { foreignKey: 'id_odf', as: 'odf' });

// Relaciones ODF -> Hilos de fibra
OdfPanel.hasMany(FiberThread, { foreignKey: 'id_odf_origen', as: 'hilos_fibra', onDelete: 'CASCADE' });
FiberThread.belongsTo(OdfPanel, { foreignKey: 'id_odf_origen', as: 'odf' });

// Relaciones PON Port -> NAP Boxes
PonPort.hasMany(NapBox, { foreignKey: 'id_puerto_pon', as: 'cajas_nap', onDelete: 'RESTRICT' });
NapBox.belongsTo(PonPort, { foreignKey: 'id_puerto_pon', as: 'puerto_pon' });

// Relaciones NAP Box -> NAP Ports
NapBox.hasMany(NapPort, { foreignKey: 'id_nap', as: 'puertos', onDelete: 'CASCADE' });
NapPort.belongsTo(NapBox, { foreignKey: 'id_nap', as: 'caja_nap' });

// Relaciones NAP Port <-> Client (1 a 1)
NapPort.hasOne(Client, { foreignKey: 'id_puerto_nap', as: 'cliente', onDelete: 'SET NULL' });
Client.belongsTo(NapPort, { foreignKey: 'id_puerto_nap', as: 'puerto_nap' });

export {
  sequelize,
  User,
  OdfPanel,
  PonPort,
  FiberThread,
  NapBox,
  NapPort,
  Client
};

