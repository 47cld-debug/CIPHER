import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps } from '@mui/material';

const Card: React.FC<MuiCardProps> = ({ children, ...props }) => {
  return <MuiCard {...props}>{children}</MuiCard>;
};

export default Card;
