export interface KnowledgeItem {
  id: string;
  category: 'operacion' | 'roles' | 'tecnico' | 'red' | 'general' | 'personalizado';
  title: string;
  keywords: string[];
  shortAnswer: string;
  detailedSteps?: string[];
  tips?: string[];
  allowedRoles?: ('Admin' | 'Soporte' | 'Tecnico')[];
  isLearned?: boolean;
  learnedId?: string;
  author?: string;
  createdAt?: string;
}

export interface ManualModule {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'MapPin' | 'UserCheck' | 'Shield' | 'Compass' | 'WifiOff' | 'FileText' | 'Activity';
  sections: {
    heading: string;
    content: string;
    points?: string[];
    important?: string;
  }[];
}

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'asignar_cliente',
    category: 'operacion',
    title: '¿Cómo asignar un cliente a un puerto libre?',
    keywords: [
      'asignar', 'cliente', 'abonado', 'conectar', 'puerto', 'nuevo cliente',
      'dar de alta', 'vincular', 'contrato', 'instalar'
    ],
    shortAnswer:
      'Para asignar un cliente a la red, localiza la Caja NAP correspondiente en el mapa, abre la matriz de 16 puertos, selecciona un puerto verde (Libre) y pulsa "Asignar Abonado".',
    detailedSteps: [
      '1. Ve al módulo "Mapa de Red" desde la barra de navegación superior.',
      '2. Haz clic sobre el marcador de la Caja NAP donde se realizará la acometida de fibra.',
      '3. En el panel inferior o lateral se desplegará la matriz de puertos.',
      '4. Haz clic en un puerto de color verde con estado "Libre".',
      '5. En el detalle del puerto, haz clic en el botón azul "Asignar Abonado".',
      '6. Completa el formulario con Código de Cliente, Nombre Completo, Marca de ONT (ZTE, Huawei, V-SOL o TP-Link), Dirección MAC (formato AA:BB:CC:DD:EE:FF), Potencia Rx en dBm y Dirección física.',
      '7. Haz clic en "Confirmar Asignación". El puerto cambiará inmediatamente a estado "Ocupado" (azul).'
    ],
    tips: [
      'Si te encuentras en campo sin cobertura de internet, el sistema guardará la asignación en modo Offline y se sincronizará automáticamente al recuperar señal.',
      'Asegúrate de que la dirección MAC cumpla el estándar de 6 bloques hexadecimales (ej. 48:2C:EA:12:34:56).'
    ]
  },
  {
    id: 'editar_cliente',
    category: 'operacion',
    title: '¿Cómo editar o corregir los datos de un cliente?',
    keywords: [
      'editar', 'corregir', 'modificar', 'cambiar datos', 'error de captura',
      'mac', 'nombre', 'ont', 'actualizar cliente', 'reparar datos'
    ],
    shortAnswer:
      'Si hubo una equivocación al capturar los datos del abonado (nombre, MAC, modelo de ONT o potencia), puedes editarlos directamente sin necesidad de liberar el puerto.',
    detailedSteps: [
      '1. En el Mapa de Red, haz clic en la Caja NAP donde está conectado el abonado.',
      '2. Selecciona el puerto azul (Ocupado) correspondiente al cliente.',
      '3. En la tarjeta de detalle del puerto, presiona el botón azul "Editar Datos".',
      '4. Modifica los campos que requieran corrección (Código, Nombre, Marca ONT, MAC, Potencia o Dirección).',
      '5. Presiona "Guardar Cambios". La información se actualizará de inmediato en la base de datos central.'
    ],
    tips: [
      'También puedes consultar y editar clientes desde el módulo "Abonados" en la barra superior usando el buscador por nombre o código.'
    ]
  },
  {
    id: 'liberar_puerto',
    category: 'operacion',
    title: '¿Cómo liberar un puerto ocupado y por qué se restringe al Técnico?',
    keywords: [
      'liberar', 'desconectar', 'quitar cliente', 'baja', 'desocupar',
      'liberar puerto', 'eliminar cliente', 'desvincular'
    ],
    shortAnswer:
      'Liberar un puerto desvincula al cliente y regresa el puerto al estado "Libre" (verde). Por seguridad operativa y control de auditoría, esta acción está permitida únicamente para los roles Soporte y Administrador.',
    detailedSteps: [
      '1. Inicia sesión con credenciales de rol Soporte o Administrador (el rol Técnico tiene esta función deshabilitada para evitar desconexiones accidentales de servicio en campo).',
      '2. Localiza la Caja NAP y selecciona el puerto ocupado (azul).',
      '3. En el detalle del puerto, presiona el botón rojo "Liberar Puerto".',
      '4. Confirma el mensaje de seguridad que advierte que el cliente será desvinculado.',
      '5. El puerto pasará a color verde y el contador de puertos libres de la NAP se incrementará automáticamente.'
    ],
    tips: [
      'Si eres Técnico y requieres dar de baja a un abonado por corte definitivo de contrato, notifica al área de Soporte Central para que autoricen la liberación.'
    ],
    allowedRoles: ['Admin', 'Soporte']
  },
  {
    id: 'roles_permisos',
    category: 'roles',
    title: '¿Qué roles existen en el sistema y qué permisos tiene cada uno?',
    keywords: [
      'roles', 'permisos', 'tecnico', 'soporte', 'admin', 'administrador',
      'rbac', 'privilegios', 'acceso', 'autorizacion'
    ],
    shortAnswer:
      'El sistema implementa Control de Acceso Basado en Roles (RBAC) con 3 niveles: Administrador, Soporte Técnico y Técnico en Campo.',
    detailedSteps: [
      'Rol Administrador (Nivel Total): Alta de nuevas cajas NAP, configuración de ODFs, asignación y liberación de puertos, edición de abonados, descarga de reportes PDF y gestión de usuarios.',
      'Rol Soporte Técnico (Nivel Operativo Central): Asignación de abonados, liberación de puertos, edición de datos técnicos, consulta de inventario y descarga de reportes ejecutivos en PDF.',
      'Rol Técnico en Campo (Nivel Operativo Terreno): Consulta de cajas y puertos, asignación de nuevos abonados en instalaciones, captura de coordenadas GPS de alta precisión en campo y edición de datos. Tiene restringida la liberación y eliminación de cajas para proteger la continuidad del servicio.'
    ],
    tips: [
      'En la barra superior puedes ver tu rol actual con una insignia de color distintivo (Índigo para Admin, Esmeralda para Soporte, Ámbar para Técnico).'
    ]
  },
  {
    id: 'crear_nap',
    category: 'red',
    title: '¿Cómo registrar una nueva Caja NAP en el mapa?',
    keywords: [
      'crear nap', 'nueva caja', 'registrar nap', 'agregar caja', 'instalar nap',
      'splitter', 'poste', 'cobertura', 'alta caja'
    ],
    shortAnswer:
      'Los usuarios con rol Administrador o Soporte pueden registrar nuevas Cajas NAP en la red haciendo clic en el botón "Nueva Caja NAP" ubicado en la barra superior del Mapa.',
    detailedSteps: [
      '1. Ve a la vista "Mapa de Red".',
      '2. En la barra de herramientas superior, haz clic en el botón azul "Nueva Caja NAP".',
      '3. Escribe el Identificador de la caja (ej. NAP-SJR-05).',
      '4. Selecciona la capacidad de puertos (8 puertos para splitter 1:8, 16 puertos estándar o 24 puertos).',
      '5. Ingresa la Zona o Sector de cobertura (ej. Barrio San Miguel / Colonia Centro).',
      '6. Especifica la Dirección física o referencia de poste (ej. Poste CFE #42, esq. Hidalgo).',
      '7. Captura las Coordenadas GPS (puedes usar el botón "GPS de mi dispositivo" o escribirlas manualmente).',
      '8. Presiona "Registrar e Inicializar NAP". Se crearán automáticamente los puertos libres correspondientes.'
    ],
    tips: [
      'El identificador se estandariza automáticamente en mayúsculas para cumplir con la nomenclatura corporativa de GPON Telecom.'
    ],
    allowedRoles: ['Admin', 'Soporte']
  },
  {
    id: 'captura_gps',
    category: 'tecnico',
    title: '¿Cómo capturar y actualizar las coordenadas GPS en campo?',
    keywords: [
      'gps', 'coordenadas', 'geolocalizacion', 'ubicacion', 'latitud', 'longitud',
      'sensor', 'campo', 'movil', 'smartphone', 'precision'
    ],
    shortAnswer:
      'Puedes capturar las coordenadas exactas de una Caja NAP utilizando el sensor GPS de tu smartphone o laptop mediante la API de geolocalización HTML5 del navegador.',
    detailedSteps: [
      '1. En el Mapa de Red, selecciona la Caja NAP que estás instalando o auditando.',
      '2. En el panel de la caja, haz clic en el botón "Capturar GPS en Campo" (icono de brújula).',
      '3. Presiona el botón "Obtener Coordenadas del Dispositivo". El navegador solicitará permiso para acceder a tu ubicación.',
      '4. El sensor calculará la Latitud y Longitud con precisión submétrica (se indicará el margen en metros, ej. +/- 3 metros).',
      '5. Si requieres afinar la coordenada manualmente, puedes editar libremente los campos numéricos de Latitud y Longitud.',
      '6. Presiona "Guardar Coordenadas". Si estás en línea se enviará al servidor; si estás sin señal se guardará en cola local.'
    ],
    tips: [
      'Para máxima precisión GPS en campo, asegúrate de activar la ubicación precisa en los ajustes de tu teléfono y estar al aire libre sin obstrucción de techos metálicos.'
    ]
  },
  {
    id: 'modo_offline',
    category: 'tecnico',
    title: '¿Cómo funciona el modo Offline (sin conexión a internet)?',
    keywords: [
      'offline', 'sin conexion', 'sin internet', 'sin senal', 'desconectado',
      'indexeddb', 'sincronizar', 'cola local', 'pwa'
    ],
    shortAnswer:
      'El sistema está diseñado como Progressive Web App (PWA) con arquitectura Offline-First, permitiendo registrar asignaciones y coordenadas GPS aun sin señal celular en zonas rurales.',
    detailedSteps: [
      '1. Cuando el dispositivo pierde señal de datos o Wi-Fi, la barra superior muestra el indicador rojo "Modo Offline".',
      '2. Puedes seguir trabajando con total normalidad: asignar clientes a puertos, registrar coordenadas GPS y consultar datos.',
      '3. Cada operación realizada sin internet se almacena en el motor IndexedDB de tu navegador como una transacción en cola pendiente.',
      '4. Al recuperar la conectividad, el sistema detecta la red automáticamente y procesa las peticiones pendientes con el backend.',
      '5. También puedes forzar la sincronización en cualquier momento haciendo clic en el botón "Sincronizar" en la barra de navegación.'
    ],
    tips: [
      'Tus datos nunca se pierden aunque cierres el navegador, gracias a la persistencia en almacenamiento seguro local.'
    ]
  },
  {
    id: 'reportes_pdf',
    category: 'operacion',
    title: '¿Cómo descargar el reporte ejecutivo de saturación en PDF?',
    keywords: [
      'pdf', 'reporte', 'descargar reporte', 'informe', 'imprimir', 'saturacion',
      'auditoria', 'exportar', 'ejecutivo'
    ],
    shortAnswer:
      'Puedes generar al vuelo un informe corporativo en formato PDF con la matriz completa de saturación, diagnósticos de alerta y padrón de clientes activos.',
    detailedSteps: [
      '1. Haz clic en "Reportes PDF" en la barra de navegación superior.',
      '2. En el panel principal podrás revisar las métricas en tiempo real de capacidad de red.',
      '3. Haz clic en el botón azul "Descargar Reporte PDF Ejecutivo".',
      '4. El backend compila mediante streaming un documento PDF membretado con formato tabla, celdas delimitadas, tarjetas KPI y numeración oficial.',
      '5. El archivo se guardará automáticamente en tu dispositivo con el nombre "reporte_gpon_saturacion_[fecha].pdf".'
    ],
    tips: [
      'El reporte clasifica automáticamente las cajas con saturación mayor o igual al 80% con diagnóstico "CRÍTICO" en color rojo para priorizar expansiones de red.'
    ],
    allowedRoles: ['Admin', 'Soporte']
  },
  {
    id: 'potencia_optica',
    category: 'red',
    title: '¿Cuáles son los valores recomendados de potencia óptica (dBm)?',
    keywords: [
      'potencia', 'dbm', 'rx', 'optica', 'laser', 'atenuacion', 'senhal',
      'ont', 'fibra', 'decibeles', 'limite'
    ],
    shortAnswer:
      'En redes GPON ITU-T G.984 clase B+, la potencia óptica recibida en la ONT (Rx Power) debe ubicarse idealmente entre -15.0 dBm y -25.0 dBm.',
    detailedSteps: [
      'Rango Óptimo (-15.0 dBm a -24.0 dBm): Excelente nivel de potencia. Señal limpia sin errores de trama ni pérdida de paquetes.',
      'Rango Aceptable (-24.1 dBm a -26.9 dBm): Conexión estable pero próxima al umbral de sensibilidad del receptor óptico.',
      'Rango Crítico (-27.0 dBm o inferior, ej. -28 dBm, -30 dBm): Riesgo inminente de desconexión por atenuación severa provocada por macrocurvaturas de fibra, empalme defectuoso o conector SC sucio.',
      'Saturación de Receptor (> -8.0 dBm): Peligro de daño físico al fotodiodo receptor por exceso de luz (generalmente ocurre si se conecta una ONT directo al puerto OLT sin splitter intermedio).'
    ],
    tips: [
      'Al dar de alta un abonado en el sistema, el valor sugerido por defecto es -19.5 dBm, que corresponde a un enlace típico balanceado con splitter 1:16.'
    ]
  },
  {
    id: 'estados_puertos',
    category: 'operacion',
    title: '¿Qué significan los colores de los puertos en la matriz de la NAP?',
    keywords: [
      'colores', 'estados', 'verde', 'azul', 'rojo', 'puertos',
      'libre', 'ocupado', 'danhado', 'mantenimiento'
    ],
    shortAnswer:
      'Cada puerto de la Caja NAP tiene un código de color normalizado para facilitar el diagnóstico visual rápido.',
    detailedSteps: [
      'Verde (Libre): Puerto disponible para contratación e instalación inmediata de un nuevo abonado.',
      'Azul (Ocupado): Puerto activo con abonado asignado, ONT registrada y contrato en servicio.',
      'Rojo (Dañado): Puerto inhabilitado por splitter dañado, atenuación excesiva o conector SC quebrado. No permite asignación hasta que Soporte o Admin lo repare.'
    ],
    tips: [
      'Para marcar un puerto como Dañado o ponerlo nuevamente Disponible, selecciónalo y utiliza las opciones de cambio de estado en la tarjeta de detalle.'
    ]
  },
  {
    id: 'eliminar_caja_nap',
    category: 'red',
    title: '¿Cómo eliminar una Caja NAP y darla de baja de la red de forma definitiva?',
    keywords: [
      'eliminar', 'eliminar caja', 'borrar caja', 'quitar caja', 'baja nap',
      'eliminar nap', 'desconectar caja', 'destruir nap', 'borrar nap', 'baja'
    ],
    shortAnswer:
      'Para dar de baja una Caja NAP de forma definitiva, selecciónala en el mapa, abre el panel de la caja y pulsa el botón rojo "Eliminar Caja NAP". Se abrirá un modal de seguridad que solicitará confirmar el nombre de la caja si tiene puertos en uso.',
    detailedSteps: [
      '1. Localiza la Caja NAP en el mapa y haz clic sobre su marcador o en el panel de puertos.',
      '2. En el panel de acciones de la caja, presiona el botón rojo "Eliminar Caja NAP".',
      '3. Se desplegará el modal de confirmación segura con el conteo de puertos y abonados vinculados.',
      '4. Si la caja contiene clientes activos, escribe el nombre de la caja (ej. NAP-SJR-01) en el campo de texto para habilitar el botón.',
      '5. Presiona "Confirmar Baja Definitiva". El backend ejecutará la transacción en PostgreSQL eliminando clientes, puertos y la caja, actualizando la topología en todos los dispositivos.'
    ],
    tips: [
      'Esta operación es permanente y purga la caja en la base de datos central.',
      'Requiere rol Administrador o Soporte Central.'
    ],
    allowedRoles: ['Admin', 'Soporte']
  },
  {
    id: 'caja_no_aparece',
    category: 'tecnico',
    title: '¿Por qué no aparecía mi Caja NAP recién creada y cómo sincronizar?',
    keywords: [
      'no aparece', 'no se ve', 'desaparece', 'telefono', 'celular', 'movil',
      'no muestra', 'no guarda', 'actualizar', 'sincronizar', 'recargar'
    ],
    shortAnswer:
      'Las cajas registradas se guardan de forma permanente en PostgreSQL. Si diste de alta una caja y en tu teléfono celular o navegador no la ves de inmediato, presiona el botón "Actualizar" en la barra de herramientas del mapa.',
    detailedSteps: [
      '1. En la parte superior del Mapa de Red, presiona el botón "Actualizar" (icono de flechas circulares).',
      '2. El sistema consultará la base de datos central y descargará la topología fresca.',
      '3. Si estabas en campo sin señal celular, la caja quedó registrada en modo Offline (IndexedDB) y se enviará al servidor tan pronto tu teléfono recupere cobertura.',
      '4. Recuerda verificar los filtros de búsqueda ("Todos los Estados" o escribir el nombre de la caja en el buscador).'
    ],
    tips: [
      'El sistema ya no borra cajas al recargar: cada registro queda resguardado en la base de datos de forma definitiva.'
    ]
  },
  {
    id: 'rutas_fibra_vial',
    category: 'red',
    title: '¿Cómo trazar rutas viales y de fibra óptica hacia una Caja NAP?',
    keywords: [
      'ruta', 'trazar ruta', 'camino', 'vial', 'como llegar', 'navegacion',
      'osrm', 'odf a nap', 'vehicular', 'distancia', 'tiempo'
    ],
    shortAnswer:
      'El sistema incluye un motor de navegación vial (OSRM) para guiar a las cuadrillas de técnicos en vehículo desde la Central ODF hasta la Caja NAP en campo.',
    detailedSteps: [
      '1. En el Mapa de Red, haz clic sobre la Caja NAP a la que deseas desplazarte.',
      '2. Presiona el botón azul "Ruta a Caja (Prueba)" o "Trazar Ruta Vial".',
      '3. El mapa calculará la ruta óptima por calles transitables, indicando distancia total en kilómetros y tiempo estimado de traslado en minutos.',
      '4. En el mapa se trazará la línea vial en color azul/índigo y en la parte superior aparecerá el banner de ruta activa.',
      '5. Para despejar la ruta del mapa, pulsa la "X" en el banner superior.'
    ],
    tips: [
      'Las líneas moradas y celestes representan las rutas físicas de cables de fibra óptica troncal provenientes del KMZ de la red.'
    ]
  },
  {
    id: 'muffas_empalmes',
    category: 'red',
    title: '¿Qué son las muffas y empalmes y cuál es su diferencia con las NAP?',
    keywords: [
      'muffas', 'empalmes', 'cierre de empalme', 'domo', 'fusion',
      'fibra troncal', 'diferencia', 'caja hermetica'
    ],
    shortAnswer:
      'Las muffas (puntos anaranjados en el mapa) son cierres de empalme herméticos donde se fusionan hilos de fibra óptica del cable troncal hacia cables de distribución. No tienen conectores para abonados.',
    detailedSteps: [
      'Muffas / Cierres de Empalme (Icono Cuadrado Naranja): Elementos pasivos herméticos que albergan bandejas de fusión de fibra óptica (ej. 24 a 96 hilos). Sirven para derivar o continuar el cable troncal.',
      'Cajas NAP (Icono Circular Verde/Azul/Rojo): Cajas terminales de distribución con splitters ópticos donde se conectan las acometidas (drop) hacia las casas de los clientes mediante conectores SC/APC.',
      'Ambos elementos georreferenciados conforman la topología híbrida de la red GPON en San José del Rincón.'
    ],
    tips: [
      'Puedes consultar la leyenda del mapa para ver el total de muffas y rutas de fibra activas en la zona.'
    ]
  },
  {
    id: 'instalar_app_pwa',
    category: 'tecnico',
    title: '¿Cómo instalar la aplicación en mi teléfono celular (PWA / APK)?',
    keywords: [
      'instalar', 'app', 'pwa', 'apk', 'telefono', 'celular', 'smartphone',
      'pantalla de inicio', 'descargar app', 'android', 'iphone'
    ],
    shortAnswer:
      'Puedes instalar la plataforma como una App nativa directamente desde el navegador de tu celular sin necesidad de tiendas de aplicaciones ni archivos externos.',
    detailedSteps: [
      '1. Abre la dirección web de la plataforma en Google Chrome (en Android) o Safari (en iOS).',
      '2. En la barra superior, haz clic en el botón verde con icono de descarga "APK".',
      '3. Si estás en Android, presiona el botón "Instalar Aplicación". Chrome añadirá la App a tu cajón de aplicaciones.',
      '4. Si estás en iPhone / iPad, pulsa el botón "Compartir" de Safari y selecciona "Agregar al inicio".',
      '5. Al abrir el icono desde tu pantalla de inicio, la aplicación se ejecutará a pantalla completa y con capacidad offline.'
    ],
    tips: [
      'La versión instalada ocupa menos de 2 MB y se actualiza sola cada vez que te conectas a internet.'
    ]
  }
];

export const MANUAL_MODULES: ManualModule[] = [
  {
    id: 'mod_mapa',
    title: '1. Mapa Geoespacial y Cajas NAP',
    subtitle: 'Navegación en terreno, localización de cajas y visualización de splitters',
    iconName: 'MapPin',
    sections: [
      {
        heading: 'Visualización de la Planta Externa',
        content:
          'El mapa muestra las cajas NAP georreferenciadas con pines interactivos. Cada marcador indica el porcentaje de saturación de la caja.',
        points: [
          'Marcador Verde / Azul: Cajas con saturación normal (< 80%).',
          'Marcador Rojo con Alerta: Cajas saturadas (>= 80%) que requieren ampliación de capacidad.',
          'Barra de Búsqueda: Permite filtrar cajas al instante por Identificador o Zona.'
        ]
      },
      {
        heading: 'Registro de Nueva Caja NAP',
        content:
          'Utiliza el botón "+ Nueva Caja NAP" en la parte superior. Requiere identificador único (ej. NAP-SJR-05), zona, referencia física y coordenadas GPS.',
        important: 'Los puertos se generan automáticamente según la capacidad elegida (8, 16 o 24 puertos).'
      }
    ]
  },
  {
    id: 'mod_puertos',
    title: '2. Asignación y Gestión de Puertos',
    subtitle: 'Conexión de abonados, registro de ONT y auditoría de potencia',
    iconName: 'UserCheck',
    sections: [
      {
        heading: 'Matriz de 16 Puertos FTTx',
        content:
          'Al hacer clic en una caja NAP se despliega la matriz interactiva de puertos con sus tres estados:',
        points: [
          'Verde: Puerto Libre disponible para instalación.',
          'Azul: Puerto Ocupado con abonado activo en servicio.',
          'Rojo: Puerto Dañado en mantenimiento técnico.'
        ]
      },
      {
        heading: 'Alta y Vinculación del Abonado',
        content:
          'Selecciona un puerto libre y pulsa "Asignar Abonado". El sistema solicita Código de Cliente, Nombre, Modelo de ONT (ZTE/Huawei/V-SOL/TP-Link), Dirección MAC y Potencia Rx.',
        important: 'La dirección MAC debe tener formato estándar de 12 dígitos hexadecimales separados por dos puntos (ej. 48:2C:EA:12:34:56).'
      },
      {
        heading: 'Edición vs Liberación de Puerto',
        content:
          'Si hubo un error al escribir el nombre o MAC, usa el botón "Editar Datos" para corregir sin desconectar el servicio. La opción "Liberar Puerto" se reserva para Soporte y Administrador para evitar bajas accidentales.'
      }
    ]
  },
  {
    id: 'mod_gps',
    title: '3. Geolocalización y Captura GPS en Campo',
    subtitle: 'Alta precisión por satélite para técnicos en postes y acometidas',
    iconName: 'Compass',
    sections: [
      {
        heading: 'Captura Automática por Sensor',
        content:
          'Desde el botón "Capturar GPS en Campo" en el detalle de la caja, pulsa "Obtener Coordenadas del Dispositivo". El sistema toma la señal satelital con reporte de precisión en metros.',
        points: [
          'Habilita los permisos de ubicación en el navegador del smartphone.',
          'Espera a que la precisión baje de +/- 10 metros para garantizar exactitud de mapeo.',
          'Puedes afinar la latitud y longitud manualmente en cualquier momento.'
        ]
      }
    ]
  },
  {
    id: 'mod_offline',
    title: '4. Funcionamiento Offline y PWA',
    subtitle: 'Operación continua en campo sin cobertura de internet móvil',
    iconName: 'WifiOff',
    sections: [
      {
        heading: 'Arquitectura Offline-First',
        content:
          'Cuando no hay cobertura celular, la aplicación continúa funcionando transparentemente:',
        points: [
          'Las asignaciones de abonados y actualizaciones de GPS se almacenan en la base de datos local IndexedDB del dispositivo.',
          'El indicador superior alertará "Modo Offline" con el número de operaciones pendientes.',
          'Al restablecer la señal, los datos se sincronizan con la base central sin intervención del técnico.'
        ]
      },
      {
        heading: 'Instalación como Aplicación Móvil (PWA)',
        content:
          'Puedes instalar el sistema en la pantalla de inicio de tu celular o tablet Android / iOS pulsando el botón "Instalar App" en la barra superior o en el menú del navegador.'
      }
    ]
  },
  {
    id: 'mod_reportes',
    title: '5. Auditoría y Reportes en Formato PDF',
    subtitle: 'Generación de informes ejecutivos con formato tabla y diagnósticos',
    iconName: 'FileText',
    sections: [
      {
        heading: 'Reporte Ejecutivo de Red',
        content:
          'Desde el módulo "Reportes PDF", pulsa "Descargar Reporte PDF Ejecutivo" para obtener el documento formal.',
        points: [
          'Matriz de saturación con celdas y bordes profesionales por cada caja NAP.',
          'Badges de diagnóstico visual: NORMAL (verde) y CRÍTICO (rojo para saturación >= 80%).',
          'Tarjetas KPI con total de puertos, ocupados, libres y porcentaje global.',
          'Directorio completo de abonados con número de contrato, puerto y niveles de señal óptica.'
        ]
      }
    ]
  },
  {
    id: 'mod_roles',
    title: '6. Matriz de Roles y Responsabilidades',
    subtitle: 'Seguridad basada en roles (RBAC) y reglas de negocio',
    iconName: 'Shield',
    sections: [
      {
        heading: 'Comparativa de Permisos',
        content:
          'La plataforma protege la integridad física de la red asignando permisos diferenciados:',
        points: [
          'Técnico: Consulta de red, asignación de nuevos abonados en campo, edición de datos de clientes, captura de GPS. Restringido: no puede liberar puertos ni crear/borrar cajas.',
          'Soporte Técnico: Asignación, edición y liberación autorizada de puertos, descarga de reportes PDF, consulta de red.',
          'Administrador: Control total del sistema, alta de cajas NAP, gestión de usuarios y configuraciones.'
        ]
      }
    ]
  }
];

export const QUICK_QUESTIONS = [
  '¿Cómo asignar un cliente a un puerto?',
  '¿Cómo eliminar una Caja NAP de forma definitiva?',
  '¿Por qué no aparecía mi caja y cómo sincronizar?',
  '¿Cómo trazar rutas viales y de fibra?',
  '¿Por qué el Técnico no puede liberar puertos?',
  '¿Cuáles son los valores recomendados de potencia (dBm)?',
  '¿Qué son las muffas y empalmes?',
  '¿Cómo capturar las coordenadas GPS en campo?',
  '¿Cómo instalar la app en mi teléfono celular?'
];

export interface PredeterminedCategory {
  id: string;
  name: string;
  iconName: string;
  description: string;
  questions: {
    question: string;
    summary: string;
  }[];
}

export const PREDETERMINED_CATEGORIES: PredeterminedCategory[] = [
  {
    id: 'cat_naps',
    name: 'Cajas NAP y Topología',
    iconName: 'MapPin',
    description: 'Alta, baja, sincronización de cajas y rutas viales',
    questions: [
      {
        question: '¿Cómo registrar una nueva Caja NAP en el mapa?',
        summary: 'Formulario de registro, capacidad de 16 puertos y GPS'
      },
      {
        question: '¿Cómo eliminar una Caja NAP y darla de baja de la red de forma definitiva?',
        summary: 'Baja atómica segura en base de datos PostgreSQL'
      },
      {
        question: '¿Por qué no aparecía mi Caja NAP recién creada y cómo sincronizar?',
        summary: 'Sincronización en servidor y botón de Actualizar'
      },
      {
        question: '¿Cómo trazar rutas viales y de fibra óptica hacia una Caja NAP?',
        summary: 'Navegación vehicular OSRM y trazado de fibra del KMZ'
      },
      {
        question: '¿Qué son las muffas y empalmes y cuál es su diferencia con las NAP?',
        summary: 'Puntos pasivos de fusión sin puertos a usuarios'
      }
    ]
  },
  {
    id: 'cat_puertos',
    name: 'Puertos y Clientes',
    iconName: 'Layers',
    description: 'Asignación, edición, liberación y códigos de color',
    questions: [
      {
        question: '¿Cómo asignar un cliente a un puerto libre?',
        summary: 'Formulario de abonado, MAC y potencia en dBm'
      },
      {
        question: '¿Cómo liberar un puerto ocupado y por qué se restringe al Técnico?',
        summary: 'Desconexión autorizada y auditoría'
      },
      {
        question: '¿Qué significan los colores de los puertos en la matriz de la NAP?',
        summary: 'Verde (Libre), Azul (Ocupado), Rojo (Dañado)'
      },
      {
        question: '¿Cómo editar o corregir los datos de un cliente?',
        summary: 'Corrección de MAC, potencia o nombre sin liberar puerto'
      }
    ]
  },
  {
    id: 'cat_potencia',
    name: 'Potencia Óptica (dBm)',
    iconName: 'Activity',
    description: 'Niveles óptimos, atenuación y diagnóstico en campo',
    questions: [
      {
        question: '¿Cuáles son los valores recomendados de potencia óptica (dBm)?',
        summary: 'Rango óptimo -15 a -25 dBm y umbrales de falla'
      }
    ]
  },
  {
    id: 'cat_roles',
    name: 'Roles y Seguridad',
    iconName: 'Shield',
    description: 'Niveles de acceso y permisos de Administrador, Soporte y Técnico',
    questions: [
      {
        question: '¿Qué roles existen en el sistema y qué permisos tiene cada uno?',
        summary: 'Control de acceso RBAC por perfil operativo'
      },
      {
        question: '¿Por qué el Técnico no puede liberar puertos?',
        summary: 'Protección operativa y prevención de cortes de servicio'
      }
    ]
  },
  {
    id: 'cat_reportes',
    name: 'Reportes y PDF',
    iconName: 'FileText',
    description: 'Generación y descarga de auditorías de saturación en PDF',
    questions: [
      {
        question: '¿Cómo descargar el reporte ejecutivo de saturación en PDF?',
        summary: 'Descarga al vuelo de métricas ejecutivas membretadas'
      }
    ]
  },
  {
    id: 'cat_movil',
    name: 'Móvil, GPS y Offline',
    iconName: 'Compass',
    description: 'Operación en campo sin cobertura e instalación como App',
    questions: [
      {
        question: '¿Cómo capturar y actualizar las coordenadas GPS en campo?',
        summary: 'Uso del sensor de ubicación del teléfono celular'
      },
      {
        question: '¿Cómo funciona el modo sin conexión (Offline)?',
        summary: 'Persistencia en IndexedDB y sincronización automática'
      },
      {
        question: '¿Cómo instalar la aplicación en mi teléfono celular (PWA / APK)?',
        summary: 'Instalación nativa rápida desde Chrome o Safari'
      }
    ]
  }
];

export interface LearnedKnowledgeItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  createdAt: string;
  author?: string;
}

const LEARNED_KEY = 'gpon_assistant_learned_v1';

export function getLearnedKnowledge(): LearnedKnowledgeItem[] {
  try {
    const raw = localStorage.getItem(LEARNED_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Error al leer conocimiento aprendido:', e);
    return [];
  }
}

export function saveLearnedKnowledge(
  question: string,
  answer: string,
  author?: string
): LearnedKnowledgeItem {
  const cleanQ = question.trim();
  const cleanA = answer.trim();

  // Generar palabras clave automáticamente
  const autoKeywords = cleanQ
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const newItem: LearnedKnowledgeItem = {
    id: `learned-${Date.now()}`,
    question: cleanQ,
    answer: cleanA,
    keywords: Array.from(new Set(autoKeywords)),
    createdAt: new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    author: author || 'Usuario'
  };

  const current = getLearnedKnowledge();
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(LEARNED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error al persistir nuevo conocimiento:', e);
  }

  return newItem;
}

export function deleteLearnedKnowledge(id: string): void {
  const current = getLearnedKnowledge();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(LEARNED_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error al eliminar conocimiento aprendido:', e);
  }
}

// Motor de búsqueda en lenguaje natural que consulta tanto la base oficial como lo aprendido por el usuario
export function searchKnowledge(query: string): { item: KnowledgeItem; score: number } | null {
  const cleanQuery = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (!cleanQuery) return null;

  const queryWords = cleanQuery.split(/\s+/).filter((w) => w.length > 2);

  let bestItem: KnowledgeItem | null = null;
  let bestScore = 0;

  // 1. Primero evaluar si hay alguna respuesta aprendida por el usuario
  const learnedItems = getLearnedKnowledge();
  for (const l of learnedItems) {
    let score = 0;
    const cleanQ = l.question
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (cleanQ.includes(cleanQuery) || cleanQuery.includes(cleanQ)) {
      score += 25; // Gran prioridad a lo que el equipo enseñó al bot
    }

    for (const kw of l.keywords) {
      if (cleanQuery.includes(kw)) score += 10;
      for (const qw of queryWords) {
        if (kw.includes(qw)) score += 5;
      }
    }

    for (const qw of queryWords) {
      if (cleanQ.includes(qw)) score += 6;
      if (l.answer.toLowerCase().includes(qw)) score += 3;
    }

    if (score > bestScore && score >= 5) {
      bestScore = score;
      bestItem = {
        id: l.id,
        category: 'personalizado',
        title: l.question,
        keywords: l.keywords,
        shortAnswer: l.answer,
        isLearned: true,
        learnedId: l.id,
        author: l.author,
        createdAt: l.createdAt
      };
    }
  }

  // 2. Si no superó umbral alto en aprendizaje, evaluar base de conocimiento del sistema
  for (const item of KNOWLEDGE_BASE) {
    let score = 0;

    // Coincidencia exacta en título
    const cleanTitle = item.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (cleanTitle.includes(cleanQuery)) {
      score += 18;
    }

    // Coincidencia en palabras clave
    for (const kw of item.keywords) {
      const cleanKw = kw
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (cleanQuery.includes(cleanKw) || cleanKw.includes(cleanQuery)) {
        score += 10;
      }

      for (const qw of queryWords) {
        if (cleanKw.includes(qw)) {
          score += 4;
        }
      }
    }

    // Coincidencia en contenido y pasos
    for (const qw of queryWords) {
      if (cleanTitle.includes(qw)) score += 5;
      if (item.shortAnswer.toLowerCase().includes(qw)) score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  if (bestItem && bestScore >= 5) {
    return { item: bestItem, score: bestScore };
  }

  return null;
}

