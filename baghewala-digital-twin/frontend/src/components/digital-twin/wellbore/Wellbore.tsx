import React from 'react';
import { Casing } from './Casing';
import { Tubing } from './Tubing';
import { SuckerRod } from './SuckerRod';
import { Pump } from './Pump';

export const Wellbore: React.FC = () => {
  return (
    <g id="component-wellbore-assembly" className="wellbore-assembly-group">
      <Casing />
      <Tubing />
      <SuckerRod />
      <Pump />
    </g>
  );
};
