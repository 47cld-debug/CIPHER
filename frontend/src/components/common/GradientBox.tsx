import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { gradients } from '../../theme/palette';

interface GradientBoxProps extends BoxProps {
  gradient?: 'redToOrange' | 'darkRedToOrange';
}

const GradientBox: React.FC<GradientBoxProps> = ({
  children,
  gradient = 'redToOrange',
  ...props
}) => {
  const gradientStyle = gradient === 'redToOrange' ? gradients.redToOrange : gradients.darkRedToOrange;

  return (
    <Box
      {...props}
      sx={{
        background: gradientStyle,
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
};

export default GradientBox;
