import os
import math
from PIL import Image, ImageDraw, ImageFont

# Fonts
FONT_TITLE = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 26)
FONT_HDR = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
FONT_TEXT = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
FONT_TEXT_BD = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
FONT_SUB = ImageFont.truetype("C:/Windows/Fonts/ariali.ttf", 16)
FONT_LANE = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)

C_WHITE = 255
C_BLACK = 0
C_SHADE = 245
C_BORDER = 0

# Helper drawing functions
def draw_rounded_rect(draw, xy, fill=C_WHITE, outline=C_BLACK, width=2, radius=12):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def draw_diamond(draw, cx, cy, rw, rh, fill=C_WHITE, outline=C_BLACK, width=2):
    pts = [(cx, cy - rh), (cx + rw, cy), (cx, cy + rh), (cx - rw, cy)]
    draw.polygon(pts, fill=fill, outline=outline)
    draw.line(pts + [pts[0]], fill=outline, width=width)

def draw_arrow(draw, x0, y0, x1, y1, width=2, head_len=14, label=None, label_side="top"):
    draw.line([(x0, y0), (x1, y1)], fill=C_BLACK, width=width)
    dx = x1 - x0
    dy = y1 - y0
    dist = math.hypot(dx, dy)
    if dist > 0:
        angle = math.atan2(dy, dx)
        ah_angle = math.pi / 6
        p1 = (x1 - head_len * math.cos(angle - ah_angle), y1 - head_len * math.sin(angle - ah_angle))
        p2 = (x1 - head_len * math.cos(angle + ah_angle), y1 - head_len * math.sin(angle + ah_angle))
        draw.polygon([(x1, y1), p1, p2], fill=C_BLACK)
    if label:
        mx = (x0 + x1) / 2
        my = (y0 + y1) / 2
        off_y = -14 if label_side == "top" else 14
        off_x = -10 if label_side == "left" else (10 if label_side == "right" else 0)
        draw.text((mx + off_x, my + off_y), label, font=FONT_SUB, fill=C_BLACK, anchor="mm")

# ==============================================================================
# 1. DIAGRAMA DE ACTIVIDADES UML (UML 2.5 Activity Diagram with Swimlanes)
# ==============================================================================
def gen_diag_actividades(out_path):
    W, H = 2600, 1800
    img = Image.new("L", (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)
    
    # 4 Swimlanes
    lane_w = (W - 120) // 4
    lane_x = [60 + i * lane_w for i in range(5)]
    lane_names = [
        "TCNICO DE CAMPO\n(App Mvil PWA)",
        "PERSISTENCIA LOCAL\n(Dexie.js / Service Worker)",
        "SERVIDOR DE APLICACIONES\n(API REST Express / JWT)",
        "BASE DE DATOS CENTRAL\n(PostgreSQL 15 ACID)"
    ]
    
    # Header row
    hdr_h = 80
    for i in range(4):
        x0, x1 = lane_x[i], lane_x[i+1]
        draw.rectangle([x0, 40, x1, 40 + hdr_h], outline=C_BLACK, width=3, fill=C_SHADE)
        draw.text(((x0 + x1) // 2, 40 + hdr_h // 2), lane_names[i], font=FONT_LANE, fill=C_BLACK, anchor="mm", align="center")
        # Vertical divider
        draw.line([(x0, 40), (x0, H - 40)], fill=C_BLACK, width=2)
    draw.line([(lane_x[4], 40), (lane_x[4], H - 40)], fill=C_BLACK, width=2)
    draw.line([(lane_x[0], H - 40), (lane_x[4], H - 40)], fill=C_BLACK, width=2)
    
    # Helper action node
    def draw_action(cx, cy, lines, w=420, h=65):
        draw_rounded_rect(draw, [cx - w//2, cy - h//2, cx + w//2, cy + h//2], fill=C_WHITE, outline=C_BLACK, width=2, radius=12)
        tot_h = len(lines) * 22
        sy = cy - tot_h // 2 + 3
        for idx, line in enumerate(lines):
            draw.text((cx, sy + idx * 22), line, font=FONT_TEXT, fill=C_BLACK, anchor="mm")
            
    # Lane centers
    l0_c = (lane_x[0] + lane_x[1]) // 2
    l1_c = (lane_x[1] + lane_x[2]) // 2
    l2_c = (lane_x[2] + lane_x[3]) // 2
    l3_c = (lane_x[3] + lane_x[4]) // 2
    
    # Node 1: Start node (black circle)
    start_y = 170
    draw.ellipse([l0_c - 18, start_y - 18, l0_c + 18, start_y + 18], fill=C_BLACK, outline=C_BLACK)
    
    # Action 1: Lane 0
    a1_y = 250
    draw_arrow(draw, l0_c, start_y + 18, l0_c, a1_y - 32)
    draw_action(l0_c, a1_y, ["Acceder a Visor GIS", "y seleccionar Caja NAP de inters"])
    
    # Action 2: Lane 0
    a2_y = 360
    draw_arrow(draw, l0_c, a1_y + 32, l0_c, a2_y - 32)
    draw_action(l0_c, a2_y, ["Abrir matriz de chasis de 16 puertos", "y seleccionar puerto en estado Libre"])
    
    # Action 3: Lane 0
    a3_y = 470
    draw_arrow(draw, l0_c, a2_y + 32, l0_c, a3_y - 32)
    draw_action(l0_c, a3_y, ["Completar contrato de abonado", "y telemetra ONT / potencia dBm"])
    
    # Decision 1: Lane 0 (Connectivity?)
    d1_y = 590
    draw_arrow(draw, l0_c, a3_y + 32, l0_c, d1_y - 35)
    draw_diamond(draw, l0_c, d1_y, 140, 35)
    draw.text((l0_c, d1_y), " Hay red mvil?", font=FONT_TEXT_BD, fill=C_BLACK, anchor="mm")
    
    # -------------------------------------------------------------
    # BRANCH ONLINE (Right path across lanes)
    # -------------------------------------------------------------
    # From d1_y (SI) -> Lane 2 HTTP POST
    draw.line([(l0_c + 140, d1_y), (l2_c, d1_y)], fill=C_BLACK, width=2)
    draw.text((l0_c + 175, d1_y - 14), "[ S (Online) ]", font=FONT_TEXT_BD, fill=C_BLACK)
    
    a4_y = 680
    draw_arrow(draw, l2_c, d1_y, l2_c, a4_y - 32)
    draw_action(l2_c, a4_y, ["Recibir HTTP POST /api/ports/:id/assign", "con token Bearer JWT y parmetros"])
    
    a5_y = 780
    draw_arrow(draw, l2_c, a4_y + 32, l2_c, a5_y - 32)
    draw_action(l2_c, a5_y, ["Validar firma HMAC-SHA256", "y verificar permisos RBAC de usuario"])
    
    # Move to Lane 3 (PostgreSQL Transaction)
    draw.line([(l2_c, a5_y + 32), (l2_c, 840), (l3_c, 840)], fill=C_BLACK, width=2)
    a6_y = 900
    draw_arrow(draw, l3_c, 840, l3_c, a6_y - 32)
    draw_action(l3_c, a6_y, ["Iniciar transaccin ACID (BEGIN)", "SELECT ... FOR UPDATE (Bloqueo pesimista)"])
    
    # Decision 2: Lane 3 (Puerto sigue libre?)
    d2_y = 1010
    draw_arrow(draw, l3_c, a6_y + 32, l3_c, d2_y - 35)
    draw_diamond(draw, l3_c, d2_y, 140, 35)
    draw.text((l3_c, d2_y), " Puerto Libre en DB?", font=FONT_TEXT_BD, fill=C_BLACK, anchor="mm")
    
    # Sub-branch NO (Conflicto / Race Condition)
    a_roll_y = 1110
    draw_arrow(draw, l3_c + 140, d2_y, l3_c + 190, d2_y, label="[ No ]", label_side="top")
    draw.line([(l3_c + 190, d2_y), (l3_c + 190, a_roll_y), (l3_c + 150, a_roll_y)], fill=C_BLACK, width=2)
    draw_action(l3_c, a_roll_y, ["ROLLBACK de transaccin", "Registrar incidente en log de auditora"], w=360)
    
    a_err_y = 1210
    draw.line([(l3_c - 180, a_roll_y), (l2_c + 200, a_roll_y), (l2_c + 200, a_err_y), (l2_c + 180, a_err_y)], fill=C_BLACK, width=2)
    draw_action(l2_c, a_err_y, ["Retornar HTTP 409 Conflict", "Detalle de error de concurrencia"], w=360)
    
    draw.line([(l2_c - 180, a_err_y), (l0_c + 200, a_err_y), (l0_c + 200, a_err_y + 40), (l0_c + 180, a_err_y + 40)], fill=C_BLACK, width=2)
    a_warn_y = a_err_y + 40
    draw_action(l0_c, a_warn_y, ["Notificar alerta de colisin al tcnico", "Refrescar matriz y solicitar reasignacin"], w=420)
    
    # End node for error
    end_err_y = a_warn_y + 90
    draw_arrow(draw, l0_c, a_warn_y + 32, l0_c, end_err_y - 20)
    draw.ellipse([l0_c - 20, end_err_y - 20, l0_c + 20, end_err_y + 20], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.ellipse([l0_c - 12, end_err_y - 12, l0_c + 12, end_err_y + 12], fill=C_BLACK, outline=C_BLACK)
    
    # Sub-branch SI (Puerto disponible -> Commit)
    a7_y = 1130
    draw_arrow(draw, l3_c, d2_y + 35, l3_c, a7_y - 32, label="[ S ]", label_side="right")
    draw_action(l3_c, a7_y, ["Mutar estado a 'Ocupado'", "Insertar Cliente y asociar NapPortId"])
    
    a8_y = 1240
    draw_arrow(draw, l3_c, a7_y + 32, l3_c, a8_y - 32)
    draw_action(l3_c, a8_y, ["Confirmar transaccin (COMMIT)", "Liberar candado pesimista de fila"])
    
    # Response HTTP 200 to Lane 2
    draw.line([(l3_c - 210, a8_y), (l2_c, a8_y)], fill=C_BLACK, width=2)
    a9_y = 1350
    draw_arrow(draw, l2_c, a8_y, l2_c, a9_y - 32)
    draw_action(l2_c, a9_y, ["Emitir respuesta HTTP 200 OK", "JSON con registro consolidado"])
    
    # Update UI in Lane 0
    draw.line([(l2_c - 210, a9_y), (l0_c, a9_y)], fill=C_BLACK, width=2)
    a10_y = 1450
    draw_arrow(draw, l0_c, a9_y, l0_c, a10_y - 32)
    draw_action(l0_c, a10_y, ["Actualizar matriz de chasis a color Rojo (Ocupado)", "Generar ticket digital de alta de servicio"])
    
    # Final Success End Node
    end_succ_y = 1550
    draw_arrow(draw, l0_c, a10_y + 32, l0_c, end_succ_y - 20)
    draw.ellipse([l0_c - 20, end_succ_y - 20, l0_c + 20, end_succ_y + 20], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.ellipse([l0_c - 12, end_succ_y - 12, l0_c + 12, end_succ_y + 12], fill=C_BLACK, outline=C_BLACK)
    
    # -------------------------------------------------------------
    # BRANCH OFFLINE (Left to Lane 1)
    # -------------------------------------------------------------
    draw.line([(l0_c - 140, d1_y), (l0_c - 170, d1_y), (l0_c - 170, 680), (l1_c, 680)], fill=C_BLACK, width=2)
    draw.text((l0_c - 210, d1_y - 14), "[ No (Offline) ]", font=FONT_TEXT_BD, fill=C_BLACK)
    
    off1_y = 740
    draw_arrow(draw, l1_c, 680, l1_c, off1_y - 32)
    draw_action(l1_c, off1_y, ["Generar registro de mutacin local", "con UUIDv4, fecha y parmetros ONT"])
    
    off2_y = 850
    draw_arrow(draw, l1_c, off1_y + 32, l1_c, off2_y - 32)
    draw_action(l1_c, off2_y, ["Encolar en tabla 'offlineQueue' (IndexedDB)", "mediante motor transaccional Dexie.js"])
    
    off3_y = 960
    draw_arrow(draw, l1_c, off2_y + 32, l1_c, off3_y - 32)
    draw_action(l1_c, off3_y, ["Actualizar estado local de puerto", "a 'Cola Offline' en almacn cliente"])
    
    # Inform Field Tech in Lane 0
    draw.line([(l1_c - 210, off3_y), (l0_c, off3_y)], fill=C_BLACK, width=2)
    off4_y = 1040
    draw_arrow(draw, l0_c, off3_y, l0_c, off4_y - 32)
    draw_action(l0_c, off4_y, ["Mostrar puerto en color mbar (Offline)", "Emitir recibo tcnico provisional al cliente"])
    
    # Loop Service Worker listener in Lane 1
    off5_y = 1150
    draw.line([(l0_c, off4_y + 32), (l0_c, off5_y), (l1_c, off5_y)], fill=C_BLACK, width=2)
    off6_y = 1240
    draw_arrow(draw, l1_c, off5_y, l1_c, off6_y - 35)
    draw_diamond(draw, l1_c, off6_y, 140, 35)
    draw.text((l1_c, off6_y), " Evento 'online' detectado?", font=FONT_TEXT_BD, fill=C_BLACK, anchor="mm")
    
    # Self loop while offline
    draw.line([(l1_c - 140, off6_y), (l1_c - 180, off6_y), (l1_c - 180, off5_y + 40), (l1_c, off5_y + 40)], fill=C_BLACK, width=2)
    draw.text((l1_c - 210, off6_y - 14), "[ No ]", font=FONT_TEXT_BD, fill=C_BLACK)
    
    # Transition to Lane 2 batch sync
    draw.line([(l1_c + 140, off6_y), (l1_c + 180, off6_y), (l1_c + 180, 1500), (l2_c, 1500)], fill=C_BLACK, width=2)
    draw.text((l1_c + 195, off6_y - 14), "[ S ]", font=FONT_TEXT_BD, fill=C_BLACK)
    
    off7_y = 1580
    draw_arrow(draw, l2_c, 1500, l2_c, off7_y - 32)
    draw_action(l2_c, off7_y, ["Despachar lote de mutaciones (Batch Sync)", "Reconciliar estados pendientes en PostgreSQL"])
    
    # Close offline branch to final success
    draw.line([(l2_c - 210, off7_y), (l1_c, off7_y)], fill=C_BLACK, width=2)
    off8_y = 1670
    draw_arrow(draw, l1_c, off7_y, l1_c, off8_y - 32)
    draw_action(l1_c, off8_y, ["Purgar cola local de asignaciones", "Confirmar integracin definitiva"])
    
    end_off_y = 1750
    draw_arrow(draw, l1_c, off8_y + 32, l1_c, end_off_y - 20)
    draw.ellipse([l1_c - 20, end_off_y - 20, l1_c + 20, end_off_y + 20], outline=C_BLACK, width=2, fill=C_WHITE)
    draw.ellipse([l1_c - 12, end_off_y - 12, l1_c + 12, end_off_y + 12], fill=C_BLACK, outline=C_BLACK)
    
    img.save(out_path, dpi=(300, 300))
    print(f"Generated: {out_path}")

# ==============================================================================
# 2. DIAGRAMA DE CLASES UML (UML Domain & Entity Class Diagram)
# ==============================================================================
def gen_diag_clases(out_path):
    W, H = 2600, 1800
    img = Image.new("L", (W, H), C_WHITE)
    draw = ImageDraw.Draw(img)
    
    # Helper to draw a UML 3-compartment class
    def draw_class(x, y, w, class_name, stereot=None, attrs=None, methods=None):
        hdr_h = 45 if not stereot else 60
        att_h = len(attrs) * 22 + 16 if attrs else 16
        met_h = len(methods) * 22 + 16 if methods else 16
        tot_h = hdr_h + att_h + met_h
        
        # Outer box
        draw.rectangle([x, y, x + w, y + tot_h], outline=C_BLACK, width=2, fill=C_WHITE)
        # Header fill
        draw.rectangle([x, y, x + w, y + hdr_h], outline=C_BLACK, width=2, fill=C_SHADE)
        
        # Header text
        if stereot:
            draw.text((x + w // 2, y + 14), stereot, font=FONT_SUB, fill=C_BLACK, anchor="mm")
            draw.text((x + w // 2, y + 38), class_name, font=FONT_HDR, fill=C_BLACK, anchor="mm")
        else:
            draw.text((x + w // 2, y + hdr_h // 2), class_name, font=FONT_HDR, fill=C_BLACK, anchor="mm")
            
        # Attributes
        curr_y = y + hdr_h + 10
        if attrs:
            for att in attrs:
                draw.text((x + 15, curr_y), att, font=FONT_TEXT, fill=C_BLACK)
                curr_y += 22
        # Separator line
        draw.line([(x, y + hdr_h + att_h), (x + w, y + hdr_h + att_h)], fill=C_BLACK, width=2)
        
        # Methods
        curr_y = y + hdr_h + att_h + 10
        if methods:
            for met in methods:
                draw.text((x + 15, curr_y), met, font=FONT_TEXT, fill=C_BLACK)
                curr_y += 22
                
        return x, y, w, tot_h
        
    # Helper for Enumerations
    def draw_enum(x, y, w, enum_name, values):
        hdr_h = 55
        val_h = len(values) * 22 + 16
        tot_h = hdr_h + val_h
        draw.rectangle([x, y, x + w, y + tot_h], outline=C_BLACK, width=2, fill=C_WHITE)
        draw.rectangle([x, y, x + w, y + hdr_h], outline=C_BLACK, width=2, fill=C_SHADE)
        draw.text((x + w // 2, y + 14), "<<enumeration>>", font=FONT_SUB, fill=C_BLACK, anchor="mm")
        draw.text((x + w // 2, y + 36), enum_name, font=FONT_HDR, fill=C_BLACK, anchor="mm")
        curr_y = y + hdr_h + 10
        for val in values:
            draw.text((x + 15, curr_y), val, font=FONT_TEXT_BD, fill=C_BLACK)
            curr_y += 22
        return x, y, w, tot_h

    # 1. Enums
    draw_enum(60, 60, 300, "RoleEnum", [
        "ADMIN_NOC",
        "SOPORTE_TECNICO",
        "TECNICO_CAMPO"
    ])
    
    draw_enum(60, 360, 300, "PortStatusEnum", [
        "LIBRE",
        "EN_PROCESO",
        "OCUPADO",
        "DAADO",
        "MANTENIMIENTO",
        "COLA_OFFLINE"
    ])
    
    # 2. User class
    u_box = draw_class(440, 60, 480, "User", attrs=[
        "+ id: Integer",
        "+ username: String",
        "+ email: String",
        "+ passwordHash: String",
        "+ role: RoleEnum",
        "+ isActive: Boolean",
        "+ createdAt: DateTime"
    ], methods=[
        "+ validatePassword(plainText: String): Boolean",
        "+ generateJwtToken(): String",
        "+ hasPermission(targetRole: RoleEnum): Boolean"
    ])
    
    # 3. OdfPanel class
    odf_box = draw_class(1020, 60, 460, "OdfPanel", attrs=[
        "+ id: Integer",
        "+ name: String",
        "+ rackLocation: String",
        "+ totalPorts: Integer",
        "+ opticalLossDb: Float"
    ], methods=[
        "+ getOccupancyRate(): Float",
        "+ getAvailablePorts(): List<PonPort>",
        "+ registerLossBudget(dB: Float): Void"
    ])
    
    # 4. PonPort class
    pon_box = draw_class(1580, 60, 450, "PonPort", attrs=[
        "+ id: Integer",
        "+ odfId: Integer",
        "+ portNumber: Integer",
        "+ wavelengthDownNm: Integer = 1490",
        "+ wavelengthUpNm: Integer = 1310",
        "+ txPowerDbm: Float = +4.5"
    ], methods=[
        "+ linkToFiberThread(fiberId: Integer): Void",
        "+ calculateTotalAttenuation(): Float"
    ])
    
    # 5. FiberThread class
    fib_box = draw_class(2110, 60, 430, "FiberThread", attrs=[
        "+ id: Integer",
        "+ cableCode: String",
        "+ threadNumber: Integer",
        "+ bufferColor: String",
        "+ fiberColor: String",
        "+ attenuationPerKm: Float = 0.35"
    ], methods=[
        "+ calculateSpanLoss(km: Float): Float",
        "+ linkToPrimarySplitter(): Void"
    ])
    
    # 6. NapBox class (Center row)
    nap_box = draw_class(1020, 560, 480, "NapBox", attrs=[
        "+ id: Integer",
        "+ code: String (NAP-SJR-XX)",
        "+ latitude: Decimal",
        "+ longitude: Decimal",
        "+ address: String",
        "+ splitterRatio: String = '1:16'",
        "+ totalCapacity: Integer = 16",
        "+ currentOccupancy: Integer",
        "+ status: String"
    ], methods=[
        "+ getSaturationRatio(): Float",
        "+ calibrateGps(lat: Decimal, lng: Decimal): Void",
        "+ getAvailablePorts(): List<NapPort>",
        "+ isThresholdCritical(): Boolean"
    ])
    
    # 7. NapPort class
    port_box = draw_class(1600, 560, 460, "NapPort", attrs=[
        "+ id: Integer",
        "+ napBoxId: Integer",
        "+ portNumber: Integer (1..16)",
        "+ status: PortStatusEnum",
        "+ assignedClientId: Integer",
        "+ connectorType: String = 'SC-APC'",
        "+ updatedAt: DateTime"
    ], methods=[
        "+ acquirePessimisticLock(tx: Tx): Void",
        "+ assignClient(client: Client): Void",
        "+ releasePort(): Void",
        "+ setMaintenance(reason: String): Void"
    ])
    
    # 8. Client class
    cli_box = draw_class(1600, 1140, 480, "Client", attrs=[
        "+ id: Integer",
        "+ contractNumber: String",
        "+ fullName: String",
        "+ address: String",
        "+ phone: String",
        "+ ontModel: String",
        "+ ontMacAddress: String",
        "+ rxOpticalPowerDbm: Decimal",
        "+ servicePlan: String"
    ], methods=[
        "+ validateMacFormat(): Boolean",
        "+ isOpticalPowerAcceptable(): Boolean",
        "+ updateTelemetry(power: Decimal): Void"
    ])
    
    # 9. FiberRoute class
    route_box = draw_class(440, 560, 480, "FiberRoute", attrs=[
        "+ id: Integer",
        "+ name: String",
        "+ routeType: String (Troncal/Ramal)",
        "+ totalLengthMeters: Float",
        "+ totalSplices: Integer",
        "+ geoJsonCoordinates: JSON"
    ], methods=[
        "+ calculateTheoreticalLoss(): Float",
        "+ getGeoJsonFeature(): Object",
        "+ addWayPoint(lat: Float, lng: Float): Void"
    ])
    
    # 10. OfflineTransaction class
    off_box = draw_class(1020, 1140, 480, "OfflineTransaction", attrs=[
        "+ id: Integer",
        "+ localUuid: UUID",
        "+ operationType: String",
        "+ payload: JSON",
        "+ status: String",
        "+ retryCount: Integer = 0",
        "+ queuedAt: DateTime",
        "+ syncedAt: DateTime"
    ], methods=[
        "+ executeReconciliation(): Promise<Boolean>",
        "+ incrementRetry(): Void",
        "+ markConflict(reason: String): Void"
    ])
    
    # Associations & Multiplicities
    # Helper to draw association line with multiplicities
    def draw_assoc(x0, y0, x1, y1, mult0=None, mult1=None, label=None, is_composition=False, is_aggregation=False):
        # If composition, draw filled diamond at (x0, y0)
        draw.line([(x0, y0), (x1, y1)], fill=C_BLACK, width=2)
        import math
        dx = x1 - x0
        dy = y1 - y0
        dist = math.hypot(dx, dy)
        if dist > 0 and (is_composition or is_aggregation):
            angle = math.atan2(dy, dx)
            d_len = 16
            d_w = 8
            # diamond points
            p_tip = (x0, y0)
            p_left = (x0 + d_len * math.cos(angle) - d_w * math.sin(angle), y0 + d_len * math.sin(angle) + d_w * math.cos(angle))
            p_back = (x0 + 2 * d_len * math.cos(angle), y0 + 2 * d_len * math.sin(angle))
            p_right = (x0 + d_len * math.cos(angle) + d_w * math.sin(angle), y0 + d_len * math.sin(angle) - d_w * math.cos(angle))
            fill_c = C_BLACK if is_composition else C_WHITE
            draw.polygon([p_tip, p_left, p_back, p_right], fill=fill_c, outline=C_BLACK)
        if label:
            mx = (x0 + x1) / 2
            my = (y0 + y1) / 2
            draw.text((mx, my - 12), label, font=FONT_SUB, fill=C_BLACK, anchor="mm")
        if mult0:
            draw.text((x0 + 15, y0 - 18), mult0, font=FONT_TEXT_BD, fill=C_BLACK)
        if mult1:
            draw.text((x1 - 35, y1 - 18), mult1, font=FONT_TEXT_BD, fill=C_BLACK)

    # OdfPanel 1 ◆-- 1..* PonPort
    draw_assoc(1480, 220, 1580, 220, mult0="1", mult1="1..*", label="contiene", is_composition=True)
    
    # PonPort 1 -- 1 FiberThread
    draw_assoc(2030, 220, 2110, 220, mult0="1", mult1="1", label="alimenta")
    
    # FiberThread 1 -- 0..* NapBox
    draw.line([(2320, 360), (2320, 480), (1260, 480), (1260, 560)], fill=C_BLACK, width=2)
    draw.text((2330, 380), "1", font=FONT_TEXT_BD, fill=C_BLACK)
    draw.text((1275, 530), "0..*", font=FONT_TEXT_BD, fill=C_BLACK)
    draw.text((1790, 465), "distribuye hilo secundario hacia", font=FONT_SUB, fill=C_BLACK, anchor="mm")
    
    # NapBox 1 ◆-- 16 NapPort
    draw_assoc(1500, 750, 1600, 750, mult0="1", mult1="16", label="aloja matriz fija", is_composition=True)
    
    # NapPort 0..1 -- 0..1 Client
    draw_assoc(1830, 960, 1830, 1140, mult0="0..1", mult1="0..1", label="conecta puerto SC-APC a")
    
    # FiberRoute 1 -- 0..* NapBox
    draw_assoc(920, 750, 1020, 750, mult0="1", mult1="0..*", label="traza f\u00edsica")
    
    # User 1 -- 0..* Client
    draw.line([(680, 420), (680, 1300), (1600, 1300)], fill=C_BLACK, width=2)
    draw.text((695, 440), "1", font=FONT_TEXT_BD, fill=C_BLACK)
    draw.text((1550, 1275), "0..*", font=FONT_TEXT_BD, fill=C_BLACK)
    draw.text((1140, 1285), "registra abonado en inventario", font=FONT_SUB, fill=C_BLACK, anchor="mm")
    
    # Client 1 -- 0..* OfflineTransaction
    draw_assoc(1600, 1380, 1500, 1380, mult0="0..*", mult1="1", label="registra cola diferida")
    
    # Legend
    draw.rectangle([60, 1640, 1000, 1750], outline=C_BLACK, width=2, fill=C_SHADE)
    draw.text((80, 1660), "NOTACIN UML 2.5:", font=FONT_HDR, fill=C_BLACK)
    draw.line([(80, 1710), (160, 1710)], fill=C_BLACK, width=2)
    draw.text((175, 1700), "Asociacin", font=FONT_TEXT, fill=C_BLACK)
    # Composition diamond
    draw.polygon([(400, 1710), (415, 1700), (430, 1710), (415, 1720)], fill=C_BLACK, outline=C_BLACK)
    draw.line([(430, 1710), (490, 1710)], fill=C_BLACK, width=2)
    draw.text((505, 1700), "Composicin Estricta", font=FONT_TEXT, fill=C_BLACK)
    
    img.save(out_path, dpi=(300, 300))
    print(f"Generated: {out_path}")

if __name__ == "__main__":
    os.makedirs("scratch", exist_ok=True)
    gen_diag_actividades("scratch/diag_actividades_asignacion_gpon.png")
    gen_diag_clases("scratch/diag_clases_dominio_gpon.png")

