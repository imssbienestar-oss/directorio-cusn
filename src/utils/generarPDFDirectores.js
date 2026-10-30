
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================
// 1. CONFIGURACIÓN GENERAL DEL DOCUMENTO
// ============================================================

const CONFIG = {
    margenIzquierdo: 15,
    margenDerecho: 15,
    margenSuperior: 65,
    margenInferior: 35,
    inicioContenido: 65,
    hojaMembretada: '/hoja_membretada.jpg',

    colores: {
        guinda: [105, 28, 50],
        verde: [16, 49, 43],
        gris: [80, 80, 80],
        grisClaro: [248, 249, 250]
    }
};


// ============================================================
// 2. FUNCIONES AUXILIARES
// ============================================================

// Normaliza el texto utilizado en nombres de archivo.
const limpiar = (valor) => String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();


// Convierte un archivo o Blob en una imagen Data URL.
const dataURLImagen = (archivo) => new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;

    lector.readAsDataURL(archivo);
});


// Carga la hoja membretada desde public.
const cargarHojaMembretada = () => new Promise((resolve) => {
    const imagen = new Image();

    imagen.onload = () => resolve(imagen);

    imagen.onerror = () => {
        console.warn(
            'No se pudo cargar la hoja membretada:',
            CONFIG.hojaMembretada
        );

        resolve(null);
    };

    imagen.src = CONFIG.hojaMembretada;
});


// Obtiene la fotografía que se enviará al PDF.
async function cargarFotografia(datos) {
    // Prioridad: fotografía nueva seleccionada en el formulario.
    if (datos.foto_nueva) {
        try {
            return await dataURLImagen(datos.foto_nueva);
        } catch (error) {
            console.warn('No se pudo cargar la fotografía nueva:', error);
            return null;
        }
    }

    // Si no existe fotografía nueva, utilizar la registrada.
    if (!datos.foto_url) {
        return null;
    }

    try {
        const respuesta = await fetch(datos.foto_url);

        if (!respuesta.ok) {
            return null;
        }

        const imagen = await respuesta.blob();

        return await dataURLImagen(imagen);

    } catch (error) {
        console.warn(
            'No se pudo recuperar la fotografía del director:',
            error
        );

        return null;
    }
}


// Normaliza los arreglos de acciones y proyectos.
const normalizarLista = (valor) => {
    if (!Array.isArray(valor)) {
        return [];
    }

    return valor
        .map(item => String(item || '').trim())
        .filter(Boolean);
};


// Da formato a las fechas para México.
const formatearFecha = (fecha) => {
    if (!fecha) {
        return new Date().toLocaleDateString('es-MX');
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
        return String(fecha);
    }

    return valor.toLocaleDateString('es-MX');
};


// ============================================================
// 3. GENERADOR PRINCIPAL DEL PDF
// ============================================================

export async function generarPDFDirectores(datos) {

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
    });

    const anchoPagina = doc.internal.pageSize.getWidth();
    const altoPagina = doc.internal.pageSize.getHeight();

    const {
        margenIzquierdo,
        margenDerecho,
        margenSuperior,
        margenInferior,
        colores
    } = CONFIG;


    // ========================================================
    // 4. HOJA MEMBRETADA INSTITUCIONAL
    // ========================================================

    const hojaMembretada = await cargarHojaMembretada();

    // Dibuja el fondo institucional en una página.
    const aplicarMembrete = () => {
        if (!hojaMembretada) {
            return;
        }

        doc.addImage(
            hojaMembretada,
            'JPEG',
            0,
            0,
            anchoPagina,
            altoPagina,
            undefined,
            'FAST'
        );
    };

    // Aplicar a la primera página.
    aplicarMembrete();

    // Aplicar automáticamente a las siguientes páginas.
    doc.internal.events.subscribe('addPage', aplicarMembrete);


    // ========================================================
    // 5. ENCABEZADO DEL FORMULARIO
    // ========================================================

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...colores.guinda);

    doc.text(
        'INFORMACIÓN DIRECTIVA HOSPITALARIA',
        anchoPagina / 2,
        43,
        { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colores.gris);

    doc.text(
        'CIUDAD DE MÉXICO',
        anchoPagina / 2,
        49,
        { align: 'center' }
    );


    // ========================================================
    // 6. FOTOGRAFÍA DEL DIRECTOR
    // ========================================================

    const fotografia = await cargarFotografia(datos);

    let filaInicial = CONFIG.inicioContenido;

    if (fotografia) {
        try {
            // Detecta el formato de la fotografía.
            const formato = fotografia.startsWith('data:image/png')
                ? 'PNG'
                : fotografia.startsWith('data:image/webp')
                    ? 'WEBP'
                    : 'JPEG';

            // Fotografía con dimensiones aproximadas de credencial.
            const anchoFoto = 28;
            const altoFoto = 36;

            const posicionX = anchoPagina
                - margenDerecho
                - anchoFoto;

            const posicionY = 57;

            doc.addImage(
                fotografia,
                formato,
                posicionX,
                posicionY,
                anchoFoto,
                altoFoto,
                undefined,
                'FAST'
            );

            // Reservar espacio para la fotografía.
            filaInicial = 98;

        } catch (error) {
            console.warn(
                'No se pudo insertar la fotografía en el PDF:',
                error
            );

            filaInicial = CONFIG.inicioContenido;
        }
    }


    // ========================================================
    // 7. ESTILOS DE TABLAS
    // ========================================================

    const estilosTabla = {
        theme: 'grid',

        margin: {
            left: margenIzquierdo,
            right: margenDerecho,
            top: margenSuperior,
            bottom: margenInferior
        },

        headStyles: {
            fillColor: colores.verde,
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            valign: 'middle',
            cellPadding: 3
        },

        bodyStyles: {
            fontSize: 8.5,
            textColor: [45, 45, 45],
            valign: 'middle',
            overflow: 'linebreak',
            cellPadding: 3
        },

        styles: {
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        }
    };


    // ========================================================
    // 8. DATOS GENERALES DEL HOSPITAL Y DIRECTOR
    // ========================================================

    autoTable(doc, {
        ...estilosTabla,

        startY: filaInicial,

        head: [[
            'DATOS GENERALES',
            'INFORMACIÓN'
        ]],

        body: [
            [
                'CLUES',
                datos.clues || 'N/A'
            ],
            [
                'Unidad médica',
                datos.nombre_hospital || 'N/A'
            ],
            [
                'Nombre del director(a)',
                datos.nombre_director || 'N/A'
            ],
            [
                'Cargo',
                datos.cargo || 'N/A'
            ],
            [
                'Correo institucional',
                datos.correo_institucional || 'N/A'
            ],
            [
                'Teléfono',
                datos.telefono || 'N/A'
            ],
            [
                'Extensión',
                datos.extension || 'N/A'
            ]
        ],

        columnStyles: {
            0: {
                cellWidth: 48,
                fontStyle: 'bold',
                fillColor: colores.grisClaro
            }
        }
    });


    // ========================================================
    // 9. ACCIONES RELEVANTES
    // ========================================================

    const acciones = normalizarLista(
        datos.acciones_relevantes
    );

    autoTable(doc, {
        ...estilosTabla,

        startY: doc.lastAutoTable.finalY + 8,

        head: [[
            'ACCIONES RELEVANTES PARA IMSS-BIENESTAR'
        ]],

        body: acciones.length > 0
            ? acciones.map((accion, indice) => [
                `${indice + 1}. ${accion}`
            ])
            : [['Sin información registrada']],

        headStyles: {
            ...estilosTabla.headStyles,
            fillColor: colores.guinda
        }
    });


    // ========================================================
    // 10. DATOS RELEVANTES
    // ========================================================

    const datosRelevantes = String(
        datos.datos_relevantes || ''
    ).trim();

    autoTable(doc, {
        ...estilosTabla,

        startY: doc.lastAutoTable.finalY + 8,

        head: [[
            'DATOS RELEVANTES'
        ]],

        body: [[
            datosRelevantes || 'Sin información registrada'
        ]],

        headStyles: {
            ...estilosTabla.headStyles,
            fillColor: colores.guinda
        }
    });


    // ========================================================
    // 11. COMPROMISOS Y PROYECTOS
    // ========================================================

    const compromisos = normalizarLista(
        datos.compromisos_proyectos
    );

    autoTable(doc, {
        ...estilosTabla,

        startY: doc.lastAutoTable.finalY + 8,

        head: [[
            'COMPROMISOS Y PROYECTOS DEL HOSPITAL'
        ]],

        body: compromisos.length > 0
            ? compromisos.map((proyecto, indice) => [
                `${indice + 1}. ${proyecto}`
            ])
            : [['Sin información registrada']],

        headStyles: {
            ...estilosTabla.headStyles,
            fillColor: colores.guinda
        }
    });


    // ========================================================
    // 12. PIE DE PÁGINA Y NUMERACIÓN
    // ========================================================

    const totalPaginas = doc.internal.getNumberOfPages();

    const fechaDocumento = formatearFecha(
        datos.fecha_actualizacion ||
        datos.fecha_registro
    );

    for (
        let numeroPagina = 1;
        numeroPagina <= totalPaginas;
        numeroPagina++
    ) {
        doc.setPage(numeroPagina);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...colores.gris);

        // Fecha del documento.
        doc.text(
            `Fecha de generación: ${fechaDocumento}`,
            margenIzquierdo,
            altoPagina - 18
        );

        // Número de página.
        doc.text(
            `Página ${numeroPagina} de ${totalPaginas}`,
            anchoPagina - margenDerecho,
            altoPagina - 18,
            { align: 'right' }
        );
    }


    // ========================================================
    // 13. NOMBRE Y SALIDA DEL ARCHIVO
    // ========================================================

    const cluesLimpia = limpiar(
        datos.clues || 'SIN_CLUES'
    );

    const hospitalLimpio = limpiar(
        datos.nombre_hospital || 'UNIDAD_MEDICA'
    );

    const nombreArchivo =
        `${cluesLimpia}_${hospitalLimpio}.pdf`;

    return {
        archivo: doc.output('blob'),
        nombreArchivo
    };
}
