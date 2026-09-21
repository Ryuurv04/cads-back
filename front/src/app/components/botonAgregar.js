// src/components/NuevoBoton.js
import React from 'react';
import Icon from '@/app/components/Icon';

const NuevoBoton = ({ onClick, texto = 'Agregar Nuevo', className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`btn primary ${className}`}
    >
      <Icon name="plus" size={16} />
      <span>{texto}</span> {/* Texto del botón */}
    </button>
  );
};
    
export default NuevoBoton;