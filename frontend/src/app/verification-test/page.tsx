'use client';

import { useTranslation } from 'react-i18next';
import { useVerification } from '@/contexts/VerificationContext';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import VerificationStatus from '@/components/VerificationStatus';

export default function VerificationTestPage() {
  const { t } = useTranslation();
  const { status, setStatus } = useVerification();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Verification Test Page
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Current Status:
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <VerificationStatus />
            <Typography>{status}</Typography>
          </Stack>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            Test Controls:
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setStatus('unverified')}
            >
              Set Unverified
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => setStatus('pending')}
            >
              Set Pending
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => setStatus('verified')}
            >
              Set Verified
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setStatus('rejected')}
            >
              Set Rejected
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Test Pages:
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              href="/verify"
            >
              Go to Verification Page
            </Button>
            <Button
              variant="outlined"
              href="/verify/status"
            >
              Go to Status Page
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
} 