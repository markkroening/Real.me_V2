import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export const Footer = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const footerSections: FooterSection[] = [
    {
      title: t('footer.about.title'),
      links: [
        { label: t('footer.about.aboutUs'), href: '/about' },
        { label: t('footer.about.careers'), href: '/careers' },
        { label: t('footer.about.blog'), href: '/blog' },
      ],
    },
    {
      title: t('footer.legal.title'),
      links: [
        { label: t('footer.legal.terms'), href: '/terms' },
        { label: t('footer.legal.privacy'), href: '/privacy' },
        { label: t('footer.legal.guidelines'), href: '/guidelines' },
      ],
    },
    {
      title: t('footer.support.title'),
      links: [
        { label: t('footer.support.help'), href: '/help' },
        { label: t('footer.support.contact'), href: '/contact' },
        {
          label: t('footer.support.status'),
          href: 'https://status.real.me',
          external: true,
        },
      ],
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      aria-label={t('footer.ariaLabel')}
      sx={{
        bgcolor: alpha(theme.palette.primary.main, 0.03),
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        py: { xs: 4, sm: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Tagline and Logo Section */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                {t('app.name')}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 300 }}
              >
                {t('footer.tagline')}
              </Typography>
            </Stack>
          </Grid>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <Grid key={section.title} item xs={12} sm={6} md={2}>
              <Typography
                variant="subtitle2"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link) => (
                  <MuiLink
                    key={link.label}
                    component={link.external ? 'a' : Link}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        {/* Copyright Section */}
        <Box
          sx={{
            mt: { xs: 4, sm: 6 },
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.875rem' }}
          >
            © {currentYear} {t('app.name')}. {t('footer.copyright')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 