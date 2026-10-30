import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Archivo público de Directorio: public/hoja_membretada.jpg
const MEMBRETE = '/hoja_membretada.jpg';
const COLORES = {
    verde: [16, 49, 43],
    guinda: [105, 28, 50],
    gris: [85, 85, 85],
    claro: [248, 249, 250]
};

const limpiarArchivo = (valor) => String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

const lista = (valor) => Array.isArray(valor)
    ? valor.map(item => String(item || '').trim()).filter(Boolean)
    : [];

const leerComoDataURL = (blob) => new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error('No se pudo leer la fotografía.'));
    lector.readAsDataURL(blob);
});

const cargarImagen = (src) => new Promise((resolve, reject) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);
    imagen.onerror = () => reject(new Error(`No se pudo cargar la imagen: ${src}`));
    imagen.src = src;
});

// Convierte cualquier imagen admitida por el navegador en JPEG y recorta
// el centro para una fotografía vertical, sin deformar la cara.
const fotografiaJpeg = async (datos) => {
    let dataURL;

    try {
        if (datos.foto_nueva) {
            dataURL = await leerComoDataURL(datos.foto_nueva);
        } else if (datos.foto_url) {
            const respuesta = await fetch(datos.foto_url);
            if (!respuesta.ok) throw new Error('No se pudo descargar la fotografía.');
            dataURL = await leerComoDataURL(await respuesta.blob());
        } else {
            return null;
        }

        const imagen = await cargarImagen(dataURL);
        const ancho = 300;
        const alto = 380;
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const escala = Math.max(ancho / imagen.width, alto / imagen.height);
        const w = imagen.width * escala;
        const h = imagen.height * escala;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, ancho, alto);
        ctx.drawImage(imagen, (ancho - w) / 2, (alto - h) / 2, w, h);
        return canvas.toDataURL('image/jpeg', 0.88);
    } catch (error) {
        console.warn('El PDF se generará sin fotografía:', error);
        return null;
    }
};

const cargarMembrete = async () => {
    try {
        return await cargarImagen(MEMBRETE);
    } catch (error) {
        console.warn('El PDF se generará sin hoja membretada:', error);
        return null;
    }
};

const fechaMX = () => new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    day: '2-digit', month: '2-digit', year: 'numeric'
}).format(new Date());

export async function generarPDFDirectores(datos) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const anchoPagina = doc.internal.pageSize.getWidth();
    const altoPagina = doc.internal.pageSize.getHeight();
    const margen = 15;
    const margenSuperiorContinuacion = 39;
    const margenInferior = 32;

    // El membrete se imprime primero, como fondo de cada página.
    const membrete = await cargarMembrete();
    const dibujarMembrete = () => {
        if (membrete) {
            doc.addImage(membrete, 'JPEG', 0, 0, anchoPagina, altoPagina, undefined, 'FAST');
        }
    };
    dibujarMembrete();
    doc.internal.events.subscribe('addPage', dibujarMembrete);

    // Encabezado principal: solamente en la primera página.
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORES.guinda);
    doc.text('INFORMACIÓN DIRECTIVA HOSPITALARIA', anchoPagina / 2, 39, {
        align: 'center'
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORES.gris);
    doc.text('CIUDAD DE MÉXICO', anchoPagina / 2, 45, { align: 'center' });

    // Nombre del hospital y fecha: se imprimen solo en la primera hoja.
    const nombreHospital = String(datos.nombre_hospital || 'UNIDAD MÉDICA').trim();
    const lineasHospital = doc.splitTextToSize(nombreHospital, 180);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...COLORES.verde);
    doc.text(lineasHospital, anchoPagina / 2, 52, { align: 'center' });

    const yFecha = 52 + (lineasHospital.length - 1) * 4.5 + 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORES.gris);
    doc.text(`Fecha de generación: ${fechaMX()}`, anchoPagina / 2, yFecha, {
        align: 'center'
    });

    const inicioDatos = yFecha + 9;
    const anchoFoto = 30;
    const altoFoto = 38;
    const separacion = 7;
    const xFoto = anchoPagina - margen - anchoFoto;
    const anchoTabla = xFoto - separacion - margen;

    // La fotografía va al lado de los datos, no encima de toda la tabla.
    const fotografia = await fotografiaJpeg(datos);
    if (fotografia) {
        doc.setDrawColor(220, 220, 220);
        doc.rect(xFoto - 0.4, inicioDatos - 0.4, anchoFoto + 0.8, altoFoto + 0.8);
        doc.addImage(fotografia, 'JPEG', xFoto, inicioDatos, anchoFoto, altoFoto, undefined, 'FAST');
    }

    const estiloTabla = {
        theme: 'grid',
        margin: {
            left: margen,
            right: margen,
            top: margenSuperiorContinuacion,
            bottom: margenInferior
        },
        headStyles: {
            fillColor: COLORES.verde,
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            cellPadding: 2.5
        },
        bodyStyles: {
            fontSize: 8.5,
            textColor: [45, 45, 45],
            overflow: 'linebreak',
            valign: 'middle',
            cellPadding: 2.5
        },
        styles: { lineColor: [220, 220, 220], lineWidth: 0.1 },
        showHead: 'everyPage'
    };

    autoTable(doc, {
        ...estiloTabla,
        startY: inicioDatos,
        tableWidth: anchoTabla,
        head: [['DATOS GENERALES', 'INFORMACIÓN']],
        body: [
            ['CLUES', datos.clues || 'N/A'],
            ['Unidad médica', nombreHospital],
            ['Director(a)', datos.nombre_director || 'N/A'],
            ['Cargo', datos.cargo || 'N/A'],
            ['Correo institucional', datos.correo_institucional || 'N/A'],
            ['Teléfono', datos.telefono || 'N/A'],
            ['Extensión', datos.extension || 'N/A']
        ],
        columnStyles: {
            0: { cellWidth: 38, fontStyle: 'bold', fillColor: COLORES.claro }
        }
    });

    // Si la tabla es corta, dejamos que la fotografía termine antes
    // de iniciar las secciones de ancho completo.
    let siguienteY = doc.lastAutoTable.finalY + 7;
    if (doc.internal.getCurrentPageInfo().pageNumber === 1) {
        siguienteY = Math.max(siguienteY, inicioDatos + (fotografia ? altoFoto : 0) + 7);
    }

    const secciones = [
        ['ACCIONES RELEVANTES PARA IMSS-BIENESTAR', lista(datos.acciones_relevantes), true],
        ['DATOS RELEVANTES', datos.datos_relevantes ? [String(datos.datos_relevantes).trim()] : [], false],
        ['COMPROMISOS Y PROYECTOS DEL HOSPITAL', lista(datos.compromisos_proyectos), true]
    ];

    for (const [titulo, elementos, numerados] of secciones) {
        const contenido = elementos.filter(Boolean);
        autoTable(doc, {
            ...estiloTabla,
            startY: siguienteY,
            head: [[titulo]],
            body: contenido.length
                ? contenido.map((valor, i) => [numerados ? `${i + 1}. ${valor}` : valor])
                : [['Sin información registrada']],
            headStyles: { ...estiloTabla.headStyles, fillColor: COLORES.guinda }
        });
        siguienteY = doc.lastAutoTable.finalY + 7;
    }

    // Solo numeración, sin fecha en el pie para evitar los logotipos.
    const paginas = doc.internal.getNumberOfPages();
    for (let pagina = 1; pagina <= paginas; pagina++) {
        doc.setPage(pagina);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORES.gris);
        doc.text(`Página ${pagina} de ${paginas}`, anchoPagina - margen, altoPagina - 25, {
            align: 'right'
        });
    }

    const nombreArchivo = `${limpiarArchivo(datos.clues || 'SIN_CLUES')}_${limpiarArchivo(nombreHospital)}.pdf`;
    return { archivo: doc.output('blob'), nombreArchivo };
}
