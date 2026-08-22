import { FaqItem, IessTramite, OfficialEntity } from '../types';

export const OFFICIAL_ENTITIES: OfficialEntity[] = [
  {
    id: 'bce',
    name: 'Banco Central del Ecuador (BCE)',
    accreditedBy: 'ARCOTEL (Acreditación Estatal)',
    type: 'Público',
    website: 'https://www.eci.bce.ec/',
    price1Year: '$16.80 + IVA',
    price5Years: '$45.00 + IVA (Token)',
    formats: ['Archivo .p12', 'Token USB Criptográfico'],
    issuanceTime: '24 a 48 horas hábiles',
    requirements: [
      'Cédula de identidad ecuatoriana o pasaporte vigente',
      'Papeleta de votación del último proceso electoral',
      'RUC actualizado en formato PDF (si requiere firma como RUC)',
      'Foto selfie sosteniendo la cédula / Video validación biométrica',
      'Comprobante de pago bancario en ventanilla o transferencia'
    ],
    description: 'Entidad pública pionera en la emisión de certificados de firma electrónica en Ecuador para personas naturales, jurídicas y funcionarios del Estado.',
    bestFor: 'Servidores públicos, Quipux, SERCOP y trámites ciudadanos institucionales.',
    badge: 'Oficial del Estado'
  },
  {
    id: 'security_data',
    name: 'Security Data Seguridad en Datos S.A.',
    accreditedBy: 'ARCOTEL',
    type: 'Privado',
    website: 'https://www.securitydata.net.ec/',
    price1Year: '$18.00 - $22.00',
    price5Years: '$55.00 (Token físico)',
    formats: ['Archivo .p12', 'Token USB Criptográfico', 'En la Nube'],
    issuanceTime: '15 a 30 minutos (Express 100% online)',
    requirements: [
      'Cédula de identidad vigente (escaneada a color)',
      'Copia de RUC emitido por el SRI (si aplica)',
      'Validación biométrica facial en línea desde celular o cámara web',
      'Pago con tarjeta de crédito/débito o depósito'
    ],
    description: 'Una de las entidades privadas más utilizadas en Ecuador para facturación electrónica del SRI, sistemas contables y firmas de contratos.',
    bestFor: 'Facturación Electrónica SRI, sistemas contables y entrega inmediata en línea.',
    badge: 'Más Rápido (15 min)'
  },
  {
    id: 'anfac',
    name: 'ANFAC Autoridad de Certificación Ecuador C.A.',
    accreditedBy: 'ARCOTEL',
    type: 'Privado',
    website: 'https://www.anfac.com.ec/',
    price1Year: '$15.00 - $20.00',
    price5Years: '$50.00',
    formats: ['Archivo .p12', 'Token USB Criptográfico', 'En la Nube'],
    issuanceTime: '30 minutos a 2 horas',
    requirements: [
      'Cédula de identidad legible',
      'Validación de identidad biométrica en vivo',
      'Correo electrónico personal o corporativo',
      'Pago en línea inmediato'
    ],
    description: 'Autoridad de certificación con presencia en múltiples países de Iberoamérica y amplia compatibilidad con FirmaEC y sistemas del SRI.',
    bestFor: 'Profesionales independientes, abogados y comercio electrónico.',
    badge: 'Económico'
  },
  {
    id: 'uanataca',
    name: 'Uanataca Ecuador S.A.',
    accreditedBy: 'ARCOTEL',
    type: 'Privado',
    website: 'https://www.uanataca.com/ec/',
    price1Year: '$17.00 - $22.00',
    price5Years: '$52.00',
    formats: ['Archivo .p12', 'En la Nube', 'Token USB Criptográfico'],
    issuanceTime: 'Emisión inmediata 24/7',
    requirements: [
      'Documento de identidad válido',
      'Verificación por video-identificación con IA',
      'Número de RUC (opcional para persona natural)'
    ],
    description: 'Especialistas en firma digital en la nube, APIs para integración con software corporativo y firma centralizada.',
    bestFor: 'Integración con sistemas ERP, empresas y firma desde dispositivos móviles.',
    badge: 'Cloud & API'
  },
  {
    id: 'icert',
    name: 'Consejo de la Judicatura (ICERT-EC)',
    accreditedBy: 'ARCOTEL',
    type: 'Público',
    website: 'https://www.funcionjudicial.gob.ec/',
    price1Year: '$16.00 + IVA',
    price5Years: '$45.00 + IVA',
    formats: ['Archivo .p12', 'Token USB Criptográfico'],
    issuanceTime: '24 a 72 horas hábiles',
    requirements: [
      'Cédula de ciudadanía ecuatoriana',
      'Papeleta de votación',
      'Matrícula o credencial profesional (para abogados)',
      'Formulario en el portal de la Función Judicial'
    ],
    description: 'Entidad de certificación de la Función Judicial del Ecuador, orientada a operadores de justicia, abogados en libre ejercicio y usuarios del SATJE.',
    bestFor: 'Abogados, peritos, jueces y trámites en el Sistema Automático de Trámite Judicial (SATJE).',
    badge: 'Sector Judicial'
  },
  {
    id: 'digifirma',
    name: 'Digifirma Ecuador S.A.',
    accreditedBy: 'ARCOTEL',
    type: 'Privado',
    website: 'https://digifirma.ec/',
    price1Year: '$18.50',
    price5Years: '$54.00',
    formats: ['Archivo .p12', 'Token USB Criptográfico'],
    issuanceTime: '30 minutos online',
    requirements: [
      'Cédula de identidad',
      'RUC descargado del SRI',
      'Validación biométrica'
    ],
    description: 'Empresa especializada en certificados digitales personales y corporativos para pymes y personas naturales.',
    bestFor: 'Pymes, emprendedores y facturación electrónica.',
    badge: 'Soporte 24/7'
  }
];

export const IESS_TRAMITES_DATA: IessTramite[] = [
  {
    id: 'fondos_reserva',
    title: 'Retiro y Acumulación de Fondos de Reserva',
    category: 'Afiliados',
    summary: 'Los fondos de reserva equivalen al 8.33% de la remuneración mensual de aportación a partir del segundo año de trabajo.',
    requirements: [
      'Tener mínimo 36 aportaciones mensuales (pueden ser acumuladas)',
      'Haber transcurrido mínimo 3 años desde la primera aportación',
      'No registrar mora patronal ni deudas en el IESS/BIESS',
      'Cuenta bancaria validada y registrada en el IESS',
      'Estar cesante por al menos 2 meses o mantener aportes consecutivos si está activo'
    ],
    steps: [
      'Ingresar al portal www.iess.gob.ec con cédula y clave de afiliado.',
      'Seleccionar menú "Afiliado" > "Servicios en Línea" > "Fondos de Reserva".',
      'Dar clic en "Solicitud de Devolución de Fondos de Reserva".',
      'Verificar el valor disponible y la cuenta bancaria destino.',
      'Confirmar la transacción e imprimir el comprobante de liquidación.'
    ],
    officialUrl: 'https://www.iess.gob.ec/es/web/afiliado/fondos-de-reserva',
    timeEstimate: '48 a 72 horas hábiles',
    cost: 'Gratuito',
    tags: ['Fondos de Reserva', 'Dinero', 'Afiliado', 'Devolución']
  },
  {
    id: 'prestamo_quirografario',
    title: 'Préstamo Quirografario BIESS',
    category: 'Préstamos',
    summary: 'Crédito de consumo inmediato para afiliados y jubilados, respaldado en sus fondos de reserva y/o cesantía acumulada.',
    requirements: [
      'Tener mínimo 36 aportaciones (al menos las 6 últimas consecutivas para relación de dependencia)',
      'Mantener valores en fondos de reserva o cesantía',
      'No registrar glosas, moras patronales ni préstamos impagos en el BIESS',
      'Capacidad de endeudamiento (máximo 50% de los ingresos líquidos certificados)',
      'Cuenta bancaria activa y validada'
    ],
    steps: [
      'Acceder a www.biess.fin.ec y dar clic en "Préstamos Quirografarios".',
      'Ingresar con cédula y clave del IESS.',
      'Elegir el tipo de rol: Afiliado o Jubilado/Pensionista.',
      'Seleccionar el monto, plazo (desde 3 hasta 60 meses) y tipo de amortización (francesa o alemana).',
      'Confirmar el correo de verificación e ingresar el código OTP de seguridad.',
      'Aceptar las condiciones del pagaré desmaterializado y finalizar.'
    ],
    officialUrl: 'https://www.biess.fin.ec/prestamos-quirografarios',
    timeEstimate: '24 a 48 horas tras aprobación',
    cost: 'Gratuito (Aplica tasa de interés regulada)',
    tags: ['BIESS', 'Crédito', 'Préstamo', 'Dinero Rápido']
  },
  {
    id: 'jubilacion_vejez',
    title: 'Jubilación Ordinaria por Vejez IESS',
    category: 'Jubilados',
    summary: 'Pensión mensual vitalicia pagada por el IESS a los afiliados que cumplen con los requisitos combinados de edad y número de imposiciones.',
    requirements: [
      'Opción 1: Sin límite de edad con 480 imposiciones (40 años de aportes).',
      'Opción 2: Mínimo 60 años de edad con 360 imposiciones (30 años de aportes).',
      'Opción 3: Mínimo 65 años de edad con 180 imposiciones (15 años de aportes).',
      'Opción 4: Mínimo 70 años de edad con 120 imposiciones (10 años de aportes).',
      'Estar cesante en todas las empresas o empleadores.',
      'No registrar deudas de préstamos en mora con el BIESS.'
    ],
    steps: [
      'Generar aviso de salida de su empleador en el sistema del IESS.',
      'Ingresar al portal web del IESS con su clave personal.',
      'Ir a "Pensionistas" > "Servicios en línea" > "Jubilación por Vejez".',
      'Registrar los datos solicitados y verificar el cálculo referencial de la pensión.',
      'Subir documentos de cuenta bancaria y esperar la resolución de concesión.'
    ],
    officialUrl: 'https://www.iess.gob.ec/es/web/pensionistas/jubilacion-ordinaria-de-vejez',
    timeEstimate: '15 a 30 días hábiles',
    cost: 'Gratuito',
    tags: ['Jubilación', 'Pensión', 'Vejez', 'Tercera Edad']
  },
  {
    id: 'cesantia_retiro',
    title: 'Retiro de Fondos de Cesantía IESS',
    category: 'Afiliados',
    summary: 'Ahorro acumulado por aportaciones del 2% mensual para contingencia por pérdida de empleo.',
    requirements: [
      'Tener mínimo 24 aportaciones no simultáneas al IESS.',
      'Contar con al menos 60 días continuos de encontrarse cesante (desempleado).',
      'No ser afiliado activo con aportes pendientes.',
      'Cuenta bancaria registrada en el IESS.'
    ],
    steps: [
      'Esperar que transcurran 60 días exactos desde la fecha de salida laboral.',
      'Ingresar a la plataforma web del IESS > "Cesantía".',
      'Llenar la solicitud virtual de retiro.',
      'El IESS procesará la transferencia a la cuenta bancaria registrada.'
    ],
    officialUrl: 'https://www.iess.gob.ec/es/web/afiliado/cesantia',
    timeEstimate: '5 a 10 días laborables',
    cost: 'Gratuito',
    tags: ['Cesantía', 'Desempleo', 'Liquidación', 'Afiliado']
  },
  {
    id: 'mecanizado_historia_laboral',
    title: 'Descarga de Mecanizado e Historia Laboral IESS',
    category: 'Afiliados',
    summary: 'Certificado oficial que detalla todos los aportes, patronos, tiempos de servicio y sueldos reportados en el IESS.',
    requirements: [
      'Cédula de ciudadanía',
      'Clave de acceso al portal del IESS'
    ],
    steps: [
      'Entrar a www.iess.gob.ec > Sección "Afiliados" > "Historial Laboral".',
      'Digitar cédula y clave personal.',
      'En el menú izquierdo, hacer clic en "Consultas" > "Tiempo de Servicio por Empleador".',
      'Hacer clic en el botón "Generar PDF" o "Imprimir Mecanizado".',
      'El documento incluye código QR y firma electrónica institucional para validar ante cualquier entidad.'
    ],
    officialUrl: 'https://www.iess.gob.ec/es/web/afiliado/historia-laboral',
    timeEstimate: 'Descarga inmediata (1 minuto)',
    cost: 'Gratuito',
    tags: ['Mecanizado', 'Historial', 'Aportes', 'Certificado']
  },
  {
    id: 'citas_medicas',
    title: 'Agendamiento de Citas Médicas IESS (Call Center 140 / Web)',
    category: 'Salud',
    summary: 'Turnos para medicina general, odontología, pediatría y ginecología en centros de salud, dispensarios y hospitales del IESS.',
    requirements: [
      'Estar al día en aportaciones (mínimo 3 meses continuos de aportes)',
      'Cédula del afiliado o dependiente (cónyuge / hijos menores de 18 años)',
      'No registrar mora patronal'
    ],
    steps: [
      'Por teléfono: Marcar al 140 (gratuito desde teléfonos fijos y celulares en Ecuador) o al 1800-100-000.',
      'Por internet: Entrar a www.iess.gob.ec > "Citas Médicas en Línea" > ingresar cédula y clave.',
      'Seleccionar el paciente (titular o dependiente registrado).',
      'Elegir provincia, cantón, especialidad médica y horario disponible.',
      'Confirmar la cita e imprimir el ticket del turno.'
    ],
    officialUrl: 'https://www.iess.gob.ec/es/web/afiliado/citas-medicas-en-linea',
    timeEstimate: 'Inmediato (Según disponibilidad de agenda médica)',
    cost: 'Gratuito para afiliados y beneficiarios',
    tags: ['Citas', 'Salud', 'Hospital IESS', 'Call Center 140']
  },
  {
    id: 'firma_electronica_guia',
    title: 'Firma Electrónica para SRI, Quipux e IESS',
    category: 'Firma Electrónica',
    summary: 'Certificado digital .p12 con valor jurídico equivalente a la firma manuscrita según la Ley de Comercio Electrónico de Ecuador.',
    requirements: [
      'Cédula de identidad legible o pasaporte',
      'RUC del SRI (para personas con actividad económica)',
      'Validación biométrica de identidad',
      'Software FirmaEC o lector de certificados instalado'
    ],
    steps: [
      'Solicitar el certificado en una entidad acreditada por ARCOTEL (BCE, Security Data, ANFAC, Uanataca).',
      'Descargar el archivo con extensión .p12 y guardar la contraseña en un lugar seguro.',
      'Descargar e instalar el software oficial FirmaEC desde www.firmadigital.gob.ec.',
      'Cargar el archivo .p12 en FirmaEC o en su software de facturación electrónica del SRI.',
      'Firmar documentos PDF, comprobantes XML o peticiones administrativas con validez plena.'
    ],
    officialUrl: 'https://www.firmadigital.gob.ec/',
    timeEstimate: '15 minutos a 24 horas',
    cost: '$15 - $25 (1 año)',
    tags: ['FirmaEC', 'Archivo p12', 'SRI', 'Quipux', 'Seguridad']
  }
];

export const FAQ_DATA: FaqItem[] = [
  {
    category: 'Firma Electrónica',
    question: '¿Qué es un archivo .p12 y para qué sirve en el Ecuador?',
    answer: 'Un archivo .p12 (estándar PKCS#12) es un contenedor criptográfico seguro que almacena tanto tu clave privada cifrada como tu certificado digital público X.509. En Ecuador se utiliza para firmar documentos PDF legalmente con FirmaEC, emitir comprobantes electrónicos autorizados por el SRI (facturas, retenciones, notas de crédito), tramitar documentos en Quipux y validar planillas de empleadores en el IESS.'
  },
  {
    category: 'Firma Electrónica',
    question: '¿Puedo usar el archivo .p12 generado en esta aplicación para facturar en el SRI en producción?',
    answer: 'El archivo .p12 generado en nuestro simulador es un certificado criptográfico real con llaves RSA y formato X.509 estándar, ideal para ambientes de prueba (Sandbox del SRI, pruebas de sistemas de facturación, desarrollo de software, firma local de documentos de prueba y aprendizaje). Sin embargo, para producción comercial y trámites jurídicos vinculantes con el Estado Ecuatoriano, la Ley de Comercio Electrónico exige que el certificado sea emitido por una Entidad de Certificación Acreditada por ARCOTEL (como Banco Central del Ecuador, Security Data, ANFAC o Uanataca).'
  },
  {
    category: 'Firma Electrónica',
    question: '¿Cómo instalo y utilizo mi archivo .p12 en FirmaEC?',
    answer: '1. Descarga el aplicativo oficial FirmaEC desde www.firmadigital.gob.ec.\n2. Abre FirmaEC y en la pestaña "Firmar Documento", selecciona "Tipo de certificado: Archivo (.p12 / .pfx)".\n3. Haz clic en "Examinar" y selecciona tu archivo .p12.\n4. Ingresa la contraseña de tu certificado.\n5. Selecciona el PDF a firmar y haz clic en "Firmar". Se estampará tu firma electrónica con código QR y estampado de tiempo.'
  },
  {
    category: 'IESS y BIESS',
    question: '¿Cuáles son los requisitos actuales para solicitar un préstamo quirografario en el BIESS?',
    answer: 'Debes contar con un mínimo de 36 aportaciones registradas en el IESS, siendo al menos las 6 últimas consecutivas para trabajadores bajo relación de dependencia. No debes tener obligaciones patronales en mora, glosas, préstamos quirografarios o hipotecarios vencidos, y debes tener fondos disponibles en cesantía o fondos de reserva para servir de garantía.'
  },
  {
    category: 'IESS y BIESS',
    question: '¿Cómo se calcula la pensión de jubilación del IESS?',
    answer: 'El IESS promedia los 60 mejores sueldos (5 mejores años de aportaciones) indexados. A este promedio se le aplica un porcentaje que varía según los años de aportaciones (desde el 43.75% para 10 años de aporte hasta el 100% para 40 o más años de aportes). Además, la pensión resultante no puede ser inferior al mínimo legal ni superar el tope máximo establecido por el IESS según el Salario Básico Unificado (SBU).'
  },
  {
    category: 'IESS y BIESS',
    question: '¿Cuándo puedo retirar mis fondos de reserva del IESS?',
    answer: 'Los afiliados activos pueden solicitar la devolución de sus fondos de reserva acumulados si cuentan con al menos 36 aportaciones mensuales (3 años de aportes acumulados). Los afiliados cesantes (desempleados) pueden retirarlos si han transcurrido 2 meses continuos de inactividad laboral sin importar el número de aportes acumulados.'
  }
];
