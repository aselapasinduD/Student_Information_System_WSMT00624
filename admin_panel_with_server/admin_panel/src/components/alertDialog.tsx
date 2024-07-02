import React, {Fragment} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface props{
  title: string;
  description: string;
  isDialogOpen: boolean;
  getIsDialogOpen: (value: boolean) => void;
  handleFormSubmitConform: (isConfirm: boolean)=> void;
}

const AlertDialog: React.FC<props> = ({title, description, isDialogOpen, getIsDialogOpen, handleFormSubmitConform}) => {

  const handleOpen = () => {
    handleFormSubmitConform(true);
    getIsDialogOpen(false);
  }
  const handleClose = () => {
    handleFormSubmitConform(false);
    getIsDialogOpen(false);
  }

  return (
    <Fragment>
      <Dialog
        open={isDialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={handleOpen} autoFocus>Yes</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

export default AlertDialog;