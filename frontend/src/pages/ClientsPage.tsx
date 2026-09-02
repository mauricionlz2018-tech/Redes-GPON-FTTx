import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import api from '../api/client';
import { Search, Users, Wifi, Filter, RefreshCw, Server } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('todas');
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/clientes${search ? `?q=${encodeURIComponent(search)}` : ''}`);
      if (res.data.success) {
        setClients(res.data.data);
      }
    } catch (e) {
      console.error('Error cargando clientes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredClients = clients.filter((c) => {
    if (brandFilter === 'todas') return true;
    return c.marca_ont === brandFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Padrón de Abonados Conectados FTTx
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Consulta y administración de clientes vinculados a puertos de cajas NAP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            Total activos: <strong className="text-sky-400">{filteredClients.length}</strong>
          </span>
          <button
            onClick={fetchClients}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            title="Recargar abonados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por abonado, código, MAC o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400">Marca ONT:</span>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="todas">Todas las marcas</option>
            <option value="ZTE">ZTE</option>
            <option value="Huawei">Huawei</option>
            <option value="V-SOL">V-SOL</option>
            <option value="TP-Link">TP-Link</option>
          </select>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre del Abonado</th>
                <th className="px-4 py-3">NAP / Puerto</th>
                <th className="px-4 py-3">Equipo ONT</th>
                <th className="px-4 py-3">MAC ONT</th>
                <th className="px-4 py-3">Potencia Rx</th>
                <th className="px-4 py-3">Dirección</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredClients.map((client) => {
                const nap = client.puerto_nap?.caja_nap;
                const portIndex = client.puerto_nap?.indice_puerto;
                const rx = client.potencia_rx_estimada;

                // Calidad de la señal óptica
                let rxColor = 'text-emerald-400';
                if (rx < -24) rxColor = 'text-red-400';
                else if (rx < -22) rxColor = 'text-amber-400';

                return (
                  <tr key={client.id_cliente} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-sky-400 whitespace-nowrap">
                      {client.numero_cliente}
                    </td>
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      {client.nombre_completo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {nap ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200">{nap.identificador}</span>
                          <span className="text-[10px] bg-slate-800 text-sky-400 border border-slate-700 px-1.5 py-0.5 rounded">
                            P#{portIndex}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Sin NAP asignada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {client.marca_ont}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {client.ont_mac}
                    </td>
                    <td className="px-4 py-3 font-mono whitespace-nowrap">
                      <span className={`font-semibold ${rxColor}`}>{rx} dBm</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={client.direccion}>
                      {client.direccion}
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No se encontraron abonados con los criterios de búsqueda especificados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

