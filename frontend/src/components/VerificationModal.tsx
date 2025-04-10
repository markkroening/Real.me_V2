'use client';

import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { VerifiedUser } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface VerificationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function VerificationModal({
  open,
  onClose,
}: VerificationModalProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleVerifyNow = () => {
    router.push('/verify');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="verification-modal-title"
      aria-describedby="verification-modal-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="verification-modal-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedUser color="primary" />
          <Typography variant="h6" component="span">
            {t('auth.verificationRequired')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography id="verification-modal-description" sx={{ mb: 2 }}>
          {t('auth.verificationRequiredMessage')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('auth.verifyDescription')}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={handleVerifyNow} variant="contained" color="primary">
          {t('auth.verifyNow')}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 