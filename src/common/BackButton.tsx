import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React from 'react';

interface BackButtonProps {
  onClick: () => void,
}

export function BackButton(props: BackButtonProps) {
  const { onClick } = props;

  return (
    <div className={"back-button"}>
      <IconButton onClick={onClick}><ArrowBackIcon/></IconButton>
    </div>
  )
}