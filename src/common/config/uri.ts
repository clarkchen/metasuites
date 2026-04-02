let BASE_URL: string,
  SLEUTH_DOMAIN: string,
  PHALCON_EXPLORER_DOMAIN: string,
  BLOCKSEC_DOMAIN: string
switch (import.meta.env.MODE) {
  case 'production':
    BASE_URL = 'https://extension.blocksec.com'
    SLEUTH_DOMAIN = 'https://metasleuth.io'
    PHALCON_EXPLORER_DOMAIN = 'https://app.blocksec.com/phalcon/explorer'
    BLOCKSEC_DOMAIN = 'https://blocksec.com'
    break
  default:
    BASE_URL = 'https://extension-dev.blocksec.com'
    SLEUTH_DOMAIN = 'https://www-dev.metasleuth.io'
    PHALCON_EXPLORER_DOMAIN = 'https://app-dev.blocksec.com/phalcon/explorer'
    BLOCKSEC_DOMAIN = 'https://www-dev.blocksec.com'
}

export { BASE_URL, SLEUTH_DOMAIN, PHALCON_EXPLORER_DOMAIN, BLOCKSEC_DOMAIN }
