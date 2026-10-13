import docx
from docx.shared import Pt
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
import shutil

DESCRIPTIONS = {
    14: (
        "Descripción y función operativa: ",
        "La tabla users gobierna la capa de autenticación, control de identidad y privilegios de acceso basados en roles (RBAC) de la plataforma. Su propósito es identificar de manera unívoca a los ingenieros del NOC (Administradores), personal de supervisión y técnicos instaladores que operan en campo, resguardando sus credenciales mediante la función hash unidireccional bcrypt. Asimismo, actúa como la entidad rectora para la auditoría y sellado de responsabilidad en cada asignación de puertos, calibración GPS o modificación física del inventario de fibra óptica, garantizando la trazabilidad de las operaciones y permitiendo deshabilitar usuarios comprometidos mediante la bandera de estado operativo sin eliminar su historial patrimonial."
    ),
    15: (
        "Descripción y función operativa: ",
        "La tabla odf_panels modela el distribuidor óptico principal (Optical Distribution Frame - ODF) alojado en la cabecera central o Centro de Operaciones de Red (NOC) de San José del Rincón. Su función primordial es actuar como el nodo raíz de origen y conmutación de toda la infraestructura de telecomunicaciones de GPON TELECOM, concentrando las bandejas organizadoras de conectores ópticos y los empalmes de salida hacia los cables troncales de planta externa. Esta entidad vincula la ubicación física y coordenadas geoespaciales de la central con los puertos emisores de las tarjetas OLT, sirviendo como ancla cartográfica para trazar el árbol jerárquico de derivación óptica y calcular la atenuación acumulada desde el punto de emisión inicial."
    ),
    16: (
        "Descripción y función operativa: ",
        "La tabla pon_ports administra el inventario lógico y físico de las interfaces Gigabit-capable Passive Optical Network de los módulos ópticos SFP/SFP+ insertados en las tarjetas del chasis OLT. Cada registro representa un puerto transmisor que emite luz en la longitud de onda descendente de 1490 nm con una potencia calibrada típica de +2.5 dBm a +7.0 dBm (Clase B+). Su objetivo operativo es gobernar el límite estricto de derivación pasiva (tasa de división de hasta 1:64 o 1:128) hacia los splitters ópticos de primer y segundo nivel, supervisando qué cajas terminales NAP cuelgan de cada puerto emisor para prevenir la saturación de ancho de banda y garantizar el balance de potencia óptica antes del ingreso a planta externa."
    ),
    17: (
        "Descripción y función operativa: ",
        "La tabla fiber_threads cataloga cada filamento individual de fibra óptica monomodo (G.652.D) que conforma el haz de los cables troncales principales que parten del ODF hacia las distintas zonas de cobertura municipal. Esta entidad implementa la norma internacional de codificación cromática TIA/EIA-598-A (código de 12 colores normalizados), registrando el estado de continuidad de cada hilo (Activo, Reserva Técnica o Dañado/Atenuado). Su relevancia operativa radica en evitar empalmes cruzados en las mufas de derivación primaria, permitiendo a los técnicos empalmadores identificar con exactitud qué hilo alimenta a cada clúster de cajas NAP y qué hilos permanecen disponibles para futuras expansiones de red."
    ),
    18: (
        "Descripción y función operativa: ",
        "La tabla nap_boxes constituye el núcleo cartográfico y operativo de la planta externa, representando las Cajas Terminales de Acceso a la Red (Network Access Point - NAP) instaladas sobre postes o fachadas en la vía pública de San José del Rincón. Su propósito es centralizar la georreferenciación satelital (coordenadas WGS84 capturadas al pie de poste), la dirección del predio, la capacidad de puertos pasivos (16 adaptadores SC-APC derivados de splitter PLC) y el cálculo dinámico del semáforo de saturación (<80% verde, 80-99% amarillo y 100% rojo). A través de esta entidad, el sistema previene la saturación imprevista, optimiza las rutas de instalación y bloquea la selección de cajas desbordadas."
    ),
    19: (
        "Descripción y función operativa: ",
        "La tabla nap_ports modela de forma isomórfica cada uno de los conectores físicos individuales que integran el chasis de las cajas NAP. Es la entidad más crítica para la concurrencia transaccional del sistema, ya que cada registro representa el punto físico de conexión con la acometida de un cliente. Sobre esta tabla se ejecuta el protocolo de bloqueo pesimista SELECT ... FOR UPDATE a nivel de fila en PostgreSQL, garantizando aislamiento ACID estricto durante las asignaciones simultáneas entre cuadrillas de campo. Esto erradica por completo la colisión de puertos, sobreescrituras accidentales y desconexiones de abonados previamente en servicio."
    ),
    20: (
        "Descripción y función operativa: ",
        "La tabla clients concentra el padrón comercial y técnico de los suscriptores residenciales y comerciales que reciben servicio de conectividad por fibra óptica. Su función es vincular contractualmente al titular del predio con su equipo terminal de usuario (ONT - Optical Network Terminal), registrando dirección MAC, número de serie, plan de velocidad y coordenadas de acometida. Mediante una relación estricta de unicidad 1 a 1 con la clave foránea id_puerto_nap, asegura que ningún cliente quede registrado sin un puerto físico asignado, al tiempo que almacena la lectura de potencia óptica recibida (Prx en dBm) para verificar que el enlace opere dentro de los umbrales de sensibilidad certificados por la norma ITU-T G.984."
    ),
    21: (
        "Descripción y función operativa: ",
        "La tabla mileage_logs gestiona la bitácora logística, operativa y de transporte de las cuadrillas técnicas asignadas al despliegue, mantenimiento correctivo e instalación de acometidas en San José del Rincón. Su propósito es llevar el control auditado del kilometraje vehicular, consumo de combustible, horas de traslado y actividades ejecutadas en campo vinculadas a cada nodo o caja NAP visitada. Esta información permite a la gerencia técnica contrastar los tiempos reales de traslado en la difícil orografía municipal contra los metrajes de fibra tendidos, generando métricas de productividad, costos operativos y trazabilidad logística para el mantenimiento patrimonial de la flota."
    ),
    22: (
        "Descripción y función operativa: ",
        "La tabla infrastructure_postes administra el catastro georreferenciado de apoyos estructurales aéreos que sostienen los tendidos de fibra óptica y las cajas terminales a lo largo de las vías públicas. Su objetivo primordial es distinguir con precisión jurídica y técnica entre los postes propiedad de la Comisión Federal de Electricidad (CFE) —sujetos a contratos de compartición de infraestructura y pago de derechos de arrendamiento por apoyo— y los postes propios instalados por GPON TELECOM. Al registrar el código rotulado en campo, altura, material (concreto, madera, metálico) y coordenadas WGS84, facilita las inspecciones de gálibo, cálculo de vanos mecánicos y auditorías patrimoniales de planta externa."
    ),
    23: (
        "Descripción y función operativa: ",
        "La tabla infrastructure_mufas centraliza el inventario técnico de los cierres de empalme óptico tipo torpedo o domo (Fiber Optic Splice Closure - FOSC con grado de hermeticidad IP68) instalados en la red aérea o subterránea. Su función es catalogar los puntos neurálgicos donde se realizan las fusiones por arco eléctrico entre los cables troncales de alto conteo y las ramificaciones de distribución hacia las cajas NAP. La tabla controla la capacidad máxima de fusiones alojadas en charolas organizadoras, el tipo de sellado termocontráctil o mecánico y su estado operativo, permitiendo a las brigadas de emergencia localizar con rapidez el torpedo exacto para intervenir enlaces cortados o añadir nuevas derivaciones sin interrumpir las fibras de paso."
    ),
    24: (
        "Descripción y función operativa: ",
        "La tabla infrastructure_routes almacena la geometría espacial vectorial, metrajes geodésicos y especificaciones técnicas de los tendidos aéreos de cable dieléctrico autosoportado (ADSS). Su objetivo es modelar la trayectoria física continua de la fibra óptica a través del arreglo de coordenadas geográficas de sus vértices, distinguiendo entre tramos de transporte troncal (48 o 96 hilos) y ramales de dispersión (12 o 24 hilos). Esta tabla es fundamental para el visor cartográfico web y la exportación KMZ, ya que calcula de manera instantánea la longitud total del enlace en metros y kilómetros, permitiendo determinar la atenuación óptica kilométrica esperada y planificar bobinas de reemplazo ante incidentes en vía pública."
    ),
    25: (
        "Descripción y función operativa: ",
        "La tabla gasas_reserva documenta los bucles circulares de cable de fibra óptica arrollados intencionalmente y fijados en crucetas o raquetas de poste a lo largo de las rutas de tendido. Su propósito operativo es registrar la disponibilidad de metraje excedente de seguridad (típicamente entre 20 y 50 metros de cable) que las cuadrillas utilizan para bajar el cable al nivel del suelo y realizar empalmes dentro del vehículo de empalme, reparar roturas mecánicas por choque de vehículos sin necesidad de reemplazar el vano completo, o derivar fibra hacia futuras terminales NAP. Al estar vinculada al poste y ruta correspondientes, garantiza que el presupuesto de atenuación considere la longitud real del vidrio instalado y no solo la distancia geodésica lineal en el mapa."
    ),
    26: (
        "Descripción y función operativa: ",
        "La estructura formal de exportación KMZ/KML sintetiza la arquitectura de interoperabilidad geográfica del sistema, permitiendo compilar en memoria del cliente la totalidad de las entidades de la base de datos PostgreSQL e IndexedDB en un único archivo comprimido estándar (Red_GPON_San_Jose_del_Rincon.kmz). Su función esencial es facultar a los auditores de planta externa, personal de supervisión y directivos para abrir, inspeccionar y validar la red completa en visores SIG profesionales de uso extendido como Google Earth Desktop/Web, QGIS y ArcGIS sin intermediación de servidores privativos. Mediante la inyección de estilos cromáticos dinámicos y descripciones tabulares en HTML CDATA para cada elemento, traslada el semáforo operativo de saturación y la ficha técnica de cada nodo a la vista satelital, agilizando dictámenes de cobertura, auditorías patrimoniales y conciliaciones de infraestructura compartida."
    )
}

def add_descriptions():
    doc_path = 'docs/Documentacion_Residencias_avance.docx'
    print(f"Abriendo {doc_path}...")
    doc = docx.Document(doc_path)
    body = doc._body._element

    # 1. Normalizar título de Tabla 21 si aún no tiene el formato estándar
    for p in doc.paragraphs:
        if 'Tabla 21. Diccionario de datos de mileage_logs' in p.text:
            p.text = 'Tabla 21. Diccionario de datos: Entidad mileage_logs (Registro de Metrajes y Despliegue de Fibra).'
            p.runs[0].font.name = 'Arial'
            print("  -> Título de Tabla 21 normalizado.")
            
    for p in doc.paragraphs[:150]:
        if 'Tabla 21. Diccionario de datos de mileage_logs' in p.text:
            p.text = 'Tabla 21. Diccionario de datos: Entidad mileage_logs (Registro de Metrajes y Despliegue de Fibra).\t119'
            p.runs[0].font.name = 'Arial'
            print("  -> Índice de Tabla 21 normalizado.")

    # 2. Localizar cada tabla del diccionario y su elemento XML
    # Buscaremos cada número de tabla del 14 al 26 en body
    for tbl_num in range(14, 27):
        target_caption = f"Tabla {tbl_num}."
        tbl_elem = None
        caption_idx = None
        
        # Buscar en body después del índice (> 500)
        for i in range(500, len(body)):
            elem = body[i]
            if elem.tag.split('}')[-1] == 'p':
                p_text = docx.text.paragraph.Paragraph(elem, doc).text.strip()
                if p_text.startswith(target_caption):
                    caption_idx = i
                    # Buscar el tbl inmediatamente posterior
                    for j in range(i+1, min(len(body), i+6)):
                        if body[j].tag.split('}')[-1] == 'tbl':
                            tbl_elem = body[j]
                            break
                    break
                    
        if tbl_elem is None:
            print(f"AVISO: No se encontró tbl para {target_caption}")
            continue

        print(f"Procesando {target_caption} (tbl en body)...")
        bold_pfx, desc_text = DESCRIPTIONS[tbl_num]

        # Crear nuevo párrafo para la descripción abajo de la tabla
        new_p = parse_xml(f'<w:p {nsdecls("w")}/>')
        tbl_elem.addnext(new_p)
        
        p_desc = docx.text.paragraph.Paragraph(new_p, doc)
        p_desc.paragraph_format.line_spacing = 1.5
        p_desc.paragraph_format.space_after = Pt(6)

        r_bold = p_desc.add_run(bold_pfx)
        r_bold.font.name = 'Arial'
        r_bold.font.size = Pt(11)
        r_bold.font.bold = True

        r_text = p_desc.add_run(desc_text)
        r_text.font.name = 'Arial'
        r_text.font.size = Pt(11)

        print(f"  -> Insertada descripción abajo de Tabla {tbl_num}.")

    # 3. Limpiar los párrafos que estaban ANTES de Tabla 25 y Tabla 26
    # ya que ahora están perfectamente integrados debajo de cada tabla
    elems_to_remove = []
    for elem in body:
        if elem.tag.split('}')[-1] == 'p':
            txt = docx.text.paragraph.Paragraph(elem, doc).text.strip()
            if txt.startswith('Para salvaguardar la continuidad del servicio ante eventuales cortes mecánicos') or \
               txt.startswith('Con el propósito de garantizar la interoperabilidad cartográfica y permitir la auditoría'):
                elems_to_remove.append(elem)

    for elem in elems_to_remove:
        body.remove(elem)
        print("  -> Eliminado párrafo redundante previo a tabla de diccionario.")

    # Guardar documento principal
    print(f"Guardando cambios en {doc_path}...")
    doc.save(doc_path)
    print("Guardado exitoso de Documentacion_Residencias_avance.docx.")

    # 4. Sincronizar Documentacion_Residencias (4).docx
    alt_path = 'docs/Documentacion_Residencias (4).docx'
    shutil.copyfile(doc_path, alt_path)
    print(f"Sincronizado {alt_path} exitosamente.")

if __name__ == '__main__':
    add_descriptions()
