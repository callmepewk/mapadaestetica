import React from "react";
import CategoriaSelector from "./CategoriaSelector";

export default function AnuncioCategoriasSection({ formData, setFormData }) {
  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  return (
    <div>
      <CategoriaSelector
        value={formData.categoria}
        onChange={(v) => update('categoria', v)}
        categoriaOutros={formData.categoria_clinica}
        onChangeOutros={(t) => update('categoria_clinica', t)}
        secundarias={formData.categorias_secundarias || []}
        onChangeSecundarias={(arr) => update('categorias_secundarias', arr)}
      />
    </div>
  );
}