import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ArticuloVariante } from './entities/articulo-variante.entity';

interface IngresoItem {
  talleId: number;
  colorId: number;
  cantidad: string;
}

@Injectable()
export class ArticuloVarianteService {
  constructor(
    @InjectRepository(ArticuloVariante)
    private repo: Repository<ArticuloVariante>,
    private dataSource: DataSource
  ) {}

  async getGrilla(articuloId: number) {
    const filas: any[] = await this.dataSource.query(
      `SELECT
        t.id          AS talle_id,
        t.codigo      AS talle_codigo,
        t.nombre      AS talle_nombre,
        at2.orden     AS talle_orden,
        c.id          AS color_id,
        c.codigo      AS color_codigo,
        c.nombre      AS color_nombre,
        ac.orden      AS color_orden,
        v.id          AS variante_id,
        CAST(COALESCE(SUM(CAST(spu.cantidad AS SIGNED)), 0) AS CHAR) AS cantidad,
        CASE WHEN v.id IS NULL THEN 'potencial' ELSE 'real' END AS estado
      FROM articulo_talle at2
      JOIN talle t ON t.id = at2.talle_id AND t.deleted_at IS NULL
      JOIN articulo_color ac ON ac.articulo_id = at2.articulo_id AND ac.deleted_at IS NULL
      JOIN color c ON c.id = ac.color_id AND c.deleted_at IS NULL
      LEFT JOIN articulo_variante v
        ON  v.articulo_id = at2.articulo_id
        AND v.talle_id    = t.id
        AND v.color_id    = c.id
        AND v.deleted_at  IS NULL
      LEFT JOIN stock_por_ubicacion spu
        ON  spu.articulo_variante_id = v.id
        AND spu.deleted_at IS NULL
      WHERE at2.articulo_id = ?
        AND at2.deleted_at  IS NULL
      GROUP BY t.id, t.codigo, t.nombre, at2.orden,
               c.id, c.codigo, c.nombre, ac.orden,
               v.id
      ORDER BY at2.orden, ac.orden`,
      [articuloId]
    );

    // Cargar códigos hex de cada color
    const colorIds = [...new Set(filas.map((f) => f.color_id))];
    let codigosMap: Map<number, string[]> = new Map();
    if (colorIds.length > 0) {
      const codigosRows: any[] = await this.dataSource.query(
        `SELECT cc.color_id, cc.hex
         FROM color_codigo cc
         WHERE cc.color_id IN (${colorIds.map(() => '?').join(',')})
           AND cc.deleted_at IS NULL
         ORDER BY cc.color_id, cc.orden`,
        colorIds
      );
      for (const row of codigosRows) {
        if (!codigosMap.has(row.color_id)) codigosMap.set(row.color_id, []);
        codigosMap.get(row.color_id)!.push(row.hex);
      }
    }

    const tallesMap = new Map<number, any>();
    const coloresMap = new Map<number, any>();

    for (const fila of filas) {
      if (!tallesMap.has(fila.talle_id)) {
        tallesMap.set(fila.talle_id, {
          id: fila.talle_id,
          codigo: fila.talle_codigo,
          nombre: fila.talle_nombre,
          orden: fila.talle_orden,
        });
      }
      if (!coloresMap.has(fila.color_id)) {
        coloresMap.set(fila.color_id, {
          id: fila.color_id,
          codigo: fila.color_codigo,
          nombre: fila.color_nombre,
          orden: fila.color_orden,
          codigos: codigosMap.get(fila.color_id) ?? [],
        });
      }
    }

    const celdas = filas.map((fila) => ({
      talleId: fila.talle_id,
      talleCodigo: fila.talle_codigo,
      talleNombre: fila.talle_nombre,
      talleOrden: fila.talle_orden,
      colorId: fila.color_id,
      colorCodigo: fila.color_codigo,
      colorNombre: fila.color_nombre,
      colorCodigos: codigosMap.get(fila.color_id) ?? [],
      colorOrden: fila.color_orden,
      varianteId: fila.variante_id,
      cantidad: fila.cantidad,
      estado: fila.estado,
    }));

    const stockTotal = celdas.reduce((sum, c) => sum + (Number(c.cantidad) || 0), 0);

    return {
      talles: Array.from(tallesMap.values()),
      colores: Array.from(coloresMap.values()),
      celdas,
      stockTotal,
    };
  }

  async registrarIngreso(articuloId: number, items: IngresoItem[]) {
    for (const item of items) {
      const existente = await this.repo.findOne({
        where: { articuloId, talleId: item.talleId, colorId: item.colorId },
      });

      if (existente) {
        const cantidadActual = parseFloat(existente.cantidad) || 0;
        const cantidadNueva = parseFloat(item.cantidad) || 0;
        await this.repo.update({ id: existente.id }, { cantidad: (cantidadActual + cantidadNueva).toString() });
      } else {
        await this.repo.save({
          articuloId,
          talleId: item.talleId,
          colorId: item.colorId,
          cantidad: item.cantidad,
        });
      }
    }
    return await this.getGrilla(articuloId);
  }

  async ajustarCantidad(varianteId: number, cantidad: string) {
    await this.repo.update({ id: varianteId }, { cantidad });
    return await this.repo.findOne({ where: { id: varianteId } });
  }

  async eliminarVariante(varianteId: number) {
    const variante = await this.repo.findOne({ where: { id: varianteId } });
    await this.repo.delete({ id: varianteId });
    return variante;
  }
}
