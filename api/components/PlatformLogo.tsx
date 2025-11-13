import * as React from 'react';

const defaultProps = {
    className: 'w-10 h-10',
};

const GeminiLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Gemini Logo</title>
        <path d="M6.91996 9.17999L12 2L17.08 9.17999L12 14.82L6.91996 9.17999Z" fill="#2563EB" />
        <path d="M12 14.82L17.08 21.9999L12 17.64L6.91996 21.9999L12 14.82Z" fill="#3B82F6" />
    </svg>
);

const YouTubeLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>YouTube Logo</title>
        <path d="M27.427 3.09C27.102 1.87 26.133 0.903 24.912 0.575C22.722 0 14 0 14 0C14 0 5.278 0 3.088 0.575C1.87 0.903 0.899 1.87 0.574 3.09C0 5.28 0 10 0 10C0 10 0 14.72 0.574 16.91C0.899 18.13 1.87 19.097 3.088 19.425C5.278 20 14 20 14 20C14 20 22.722 20 24.912 19.425C26.133 19.097 27.102 18.13 27.427 16.91C28 14.72 28 10 28 10C28 10 28 5.28 27.427 3.09Z" fill="#FF0000"/>
        <path d="M11.199 14.286V5.714L18.4 10L11.199 14.286Z" fill="white"/>
    </svg>
);

const TikTokLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>TikTok Logo</title>
        <path d="M12.525 0.024H8.082V13.29H12.525C12.525 11.012 14.542 9.012 16.842 9.012V4.545C14.542 4.545 12.525 2.304 12.525 0.024Z" fill="#25F4EE"/>
        <path d="M12.525 0.024H8.082V13.29H12.525C12.525 11.012 14.542 9.012 16.842 9.012V4.545C14.542 4.545 12.525 2.304 12.525 0.024Z" fill="#FE2C55" transform="translate(4 4)"/>
        <path d="M16.842 9.012V13.488C14.542 13.488 12.525 15.512 12.525 17.766H16.968C16.968 15.512 18.985 13.488 21.285 13.488V9.012H16.842Z" fill="#000000"/>
    </svg>
);

const FacebookLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Facebook Logo</title>
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" />
    </svg>
);

const ClickBankLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>ClickBank Logo</title>
        <rect width="24" height="24" rx="4" fill="#333"/>
        <path d="M8 8v8h8V8H8zm6 6H10v-4h4v4z" fill="white"/>
        <path d="M6 10h1v4H6zm11 0h1v4h-1z" fill="white"/>
    </svg>
);

const AmazonAssociatesLogo = (props: React.SVGProps<SVGSVGElement>) => (
     <svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Amazon Associates Logo</title>
        <path d="M24.6 15.8c0 2.9-2 4.8-5 4.8-2.9 0-5-1.9-5-4.8 0-2.9 2-4.8 5-4.8 3 0 5 1.9 5 4.8zm-8.1 0c0 1.8 1.2 3.1 3.1 3.1 1.9 0 3.1-1.3 3.1-3.1 0-1.8-1.2-3.1-3.1-3.1-1.9 0-3.1 1.3-3.1 3.1zM34.9 11.3h1.9v8.9h-1.9zM42.8 11.3h1.9v8.9h-1.9zM52.3 11c-2.3 0-3.9 1.6-3.9 3.7v5.2h-1.9V11.3h1.9v1c.6-1 1.8-1.3 2.8-1.3 2.5 0 3.7 1.8 3.7 4.5v4.7h-1.9v-4.4c0-1.7-.8-2.6-2.4-2.6zM61.9 11c-2.8 0-4.6 1.9-4.6 4.8s1.8 4.8 4.6 4.8c1.3 0 2.4-.5 3.1-1.3v1h1.8V11.3h-1.8v1c-.7-.8-1.8-1.3-3.1-1.3zm.1 8c-1.6 0-2.7-1.3-2.7-3.2s1.1-3.2 2.7-3.2c1.6 0 2.6 1.3 2.6 3.2s-1 3.2-2.6 3.2zM75.1 11.3l-2.4 6.1-2.4-6.1h-2l3.7 8.6h1.5l3.7-8.6z" fill="#000"/>
        <path d="M90.3 13.9c0-1.5-1.2-2.6-2.9-2.6-1.7 0-2.9 1.1-2.9 2.6 0 1.5 1.2 2.6 2.9 2.6 1.7 0 2.9-1.1 2.9-2.6zm-7.6 6.3c2.4-1.1 3.7-3.1 3.7-5.5 0-3.5-2.4-5.9-5.9-5.9-3.5 0-5.9 2.4-5.9 5.9 0 2.4 1.3 4.4 3.7 5.5l-.2.2c-.2.2-.2.6 0 .8l.3.3c.2.2.6.2.8 0l.2-.2z" fill="#FF9900"/>
    </svg>
);

const ShopifyLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="#7AB55C" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Shopify Logo</title>
        <path d="M19.33,10.25a6.45,6.45,0,0,0-5.1-4.72,1,1,0,0,0-1,0,7.39,7.39,0,0,0-6.44,0,1,1,0,0,0-1,0,6.45,6.45,0,0,0-5.1,4.72,1,1,0,0,0,0,1,6.45,6.45,0,0,0,5.1,4.72,1,1,0,0,0,1,0,7.39,7.39,0,0,0,6.44,0,1,1,0,0,0,1,0,6.45,6.45,0,0,0,5.1-4.72,1,1,0,0,0,0-1Zm-7.38,3.29a3.86,3.86,0,0,1-3.32-2.31l.09,0a3.86,3.86,0,0,1,3.23-1.46,3.67,3.67,0,0,1,2,.61,3.86,3.86,0,0,1-2,5.47Z"/>
    </svg>
);

const TelegramLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Telegram Logo</title>
        <path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" fill="#2AABEE"/>
        <path d="m9.4 16.4 6.1-5.8-9-3.7 12-4.4-3.1 11.5-2.6-2.9-3.4 3.3z" fill="#fff"/>
    </svg>
);

const InstagramLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Instagram Logo</title>
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-grad)"/>
      <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" fill="#fff"/>
      <circle cx="16.5" cy="7.5" r="1.25" fill="#fff"/>
    </svg>
);

const XLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>X Logo</title>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

const LazadaLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Lazada Logo</title>
        <rect width="24" height="24" rx="4" fill="#0F146D"/>
        <path d="M6.5 8.5H11.5L8.5 15.5H13.5" stroke="#F7941D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 8.5L17.5 12L15 15.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ShopeeLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Shopee Logo</title>
        <rect width="24" height="24" rx="4" fill="#EE4D2D"/>
        <path d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z" fill="white"/>
        <path d="M17.5 8C19.1569 8 20.5 9.34315 20.5 11V17.5C20.5 19.1569 19.1569 20.5 17.5 20.5H6.5C4.84315 20.5 3.5 19.1569 3.5 17.5V11C3.5 9.34315 4.84315 8 6.5 8H7.5V9H6.5C5.39543 9 4.5 9.89543 4.5 11V17.5C4.5 18.6046 5.39543 19.5 6.5 19.5H17.5C18.6046 19.5 19.5 18.6046 19.5 17.5V11C19.5 9.89543 18.6046 9 17.5 9H16.5V8H17.5Z" fill="white"/>
        <path d="M12 12C10.3431 12 9 13.3431 9 15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15C15 13.3431 13.6569 12 12 12Z" fill="#EE4D2D"/>
        <rect x="11" y="11" width="2" height="5" fill="white"/>
    </svg>
);

const TikiLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Tiki Logo</title>
        <rect width="24" height="24" rx="4" fill="#1A94FF"/>
        <path d="M12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7Z" fill="white"/>
        <path d="M12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9Z" fill="#1A94FF"/>
        <path d="M10 10.5L12 13.5L14 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const ImpactLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Impact.com Logo</title>
        <rect width="24" height="24" rx="4" fill="#F05D38"/>
        <path d="M12 2L2 12L12 22L22 12L12 2Z" fill="white" fillOpacity="0.1"/>
        <path d="M12 6.41L17.59 12L12 17.59L6.41 12L12 6.41ZM12 4L4 12L12 20L20 12L12 4Z" fill="white"/>
    </svg>
);

const PartnerStackLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>PartnerStack Logo</title>
        <rect width="24" height="24" rx="4" fill="#4B40EE"/>
        <path d="M7 7H12V12H7V7Z" fill="white"/>
        <path d="M12 12H17V17H12V12Z" fill="white" fillOpacity="0.7"/>
    </svg>
);

const PinterestLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="#E60023" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Pinterest Logo</title>
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.19 2.59 7.79 6.22 9.25.08-.34.1-1.22.1-1.22s-.22-.88-.22-1.94c0-1.82 1.05-3.18 2.35-3.18 1.1 0 1.63.83 1.63 1.83 0 1.1-.7 2.75-1.05 4.28-.3 1.28.64 2.33 1.9 2.33 2.25 0 3.98-2.9 3.98-6.3 0-2.6-1.88-4.6-4.83-4.6-3.3 0-5.35 2.5-5.35 5.08 0 .98.38 2.05.86 2.63.1.1.1.2 0 .34-.05.1-.18.22-.22.28-.1.14-.14.28-.28.14-1.1-.9-1.78-2.64-1.78-4.5 0-3.5 2.9-7.16 7.85-7.16 4.15 0 7.35 3 7.35 6.7 0 4.14-2.23 7.35-5.58 7.35-1.1 0-2.13-.58-2.48-1.28l-.68 2.5c-.24.9-.9 2.08-1.34 2.73A10.02 10.02 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
);

const Digistore24Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Digistore24 Logo</title>
        <circle cx="12" cy="12" r="10" fill="#007BFF"/>
        <path d="M9.5 16V8l7 4-7 4z" fill="white"/>
    </svg>
);

const ZaloLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Zalo Logo</title>
      <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" fill="#0068FF" />
      <path d="M17.5 9.5a5 5 0 00-11 0c0 3.5 4 6.5 5.5 6.5s5.5-3 5.5-6.5z" fill="#fff" />
      <circle cx="9.5" cy="9.5" r="1.5" fill="#0068FF" />
      <circle cx="14.5" cy="9.5" r="1.5" fill="#0068FF" />
      <path d="M9 13c.667 1 2 1.333 3 .5" stroke="#0068FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PlatformLogo: React.FC<{ platformId: string; className?: string }> = ({ platformId, className }) => {
    const props = { className: className || defaultProps.className };

    switch (platformId) {
        case 'gemini': return <GeminiLogo {...props} />;
        case 'youtube': return <YouTubeLogo {...props} />;
        case 'tiktok': return <TikTokLogo {...props} />;
        case 'facebook': return <FacebookLogo {...props} />;
        case 'instagram': return <InstagramLogo {...props} />;
        case 'x': return <XLogo {...props} />;
        case 'pinterest': return <PinterestLogo {...props} />;
        case 'telegram': return <TelegramLogo {...props} />;
        case 'zalo': return <ZaloLogo {...props} />;
        case 'clickbank': return <ClickBankLogo {...props} />;
        case 'amazon': return <AmazonAssociatesLogo {...props} />;
        case 'shopify': return <ShopifyLogo {...props} />;
        case 'impact': return <ImpactLogo {...props} />;
        case 'partnerstack': return <PartnerStackLogo {...props} />;
        case 'digistore24': return <Digistore24Logo {...props} />;
        case 'lazada': return <LazadaLogo {...props} />;
        case 'shopee': return <ShopeeLogo {...props} />;
        case 'tiki': return <TikiLogo {...props} />;
        default: return null;
    }
};