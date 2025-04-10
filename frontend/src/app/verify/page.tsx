'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useVerification } from '@/contexts/VerificationContext';
import {
  Box,
  Button,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';

const steps = ['photo', 'selfie', 'review'];

export default function VerifyPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setStatus } = useVerification();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    setStatus('pending');
    router.push('/verify/status');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('verification.title')}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((step) => (
            <Step key={step}>
              <StepLabel>{t(`verification.steps.${step}`)}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 4 }}>
          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ mt: 2, mb: 1 }}>
                {t('verification.allStepsCompleted')}
              </Typography>
              <Button onClick={handleSubmit} variant="contained" sx={{ mt: 3 }}>
                {t('verification.submit')}
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography sx={{ mt: 2, mb: 1 }}>
                {t(`verification.stepContent.${steps[activeStep]}`)}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  {t('common.back')}
                </Button>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleNext}>
                  {activeStep === steps.length - 1
                    ? t('common.finish')
                    : t('common.next')}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
} 