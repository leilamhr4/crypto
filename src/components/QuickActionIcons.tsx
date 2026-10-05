type QuickActionIconProps = {
  className?: string;
};

export function Deposit3DIcon({ className }: QuickActionIconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="deposit-top" x1="9" y1="17" x2="39" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#91B6DE" />
          <stop offset="1" stopColor="#496889" />
        </linearGradient>
        <linearGradient id="deposit-left" x1="9" y1="23" x2="24" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#527398" />
          <stop offset="1" stopColor="#283D56" />
        </linearGradient>
        <linearGradient id="deposit-right" x1="24" y1="28" x2="39" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D91B8" />
          <stop offset="1" stopColor="#344D69" />
        </linearGradient>
        <linearGradient id="deposit-arrow" x1="24" y1="4" x2="24" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2F1FF" />
          <stop offset="1" stopColor="#86ACD4" />
        </linearGradient>
        <filter id="deposit-shadow" x="3" y="12" width="42" height="36" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <ellipse cx="24" cy="41.5" rx="15.5" ry="3" fill="#060B11" opacity=".45" filter="url(#deposit-shadow)" />
      <path d="M9 22.5 24 15l15 7.5-15 7.7-15-7.7Z" fill="url(#deposit-top)" />
      <path d="M9 22.5v13.8l15 7.4V30.2l-15-7.7Z" fill="url(#deposit-left)" />
      <path d="M24 30.2v13.5l15-7.4V22.5l-15 7.7Z" fill="url(#deposit-right)" />
      <path d="m15 22.6 9 4.6 9-4.6" fill="none" stroke="#D9ECFF" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".48" strokeWidth="1.2" />
      <path d="M24 4.5v14.7m-5-4.4 5 5 5-5" fill="none" stroke="url(#deposit-arrow)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" />
      <path d="M12 24.2v10.2m2.6-8.8v10.1" stroke="#BFD9F4" strokeLinecap="round" strokeOpacity=".18" strokeWidth=".8" />
    </svg>
  );
}

export function Withdraw3DIcon({ className }: QuickActionIconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="withdraw-top" x1="9" y1="17" x2="39" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#91B6DE" />
          <stop offset="1" stopColor="#496889" />
        </linearGradient>
        <linearGradient id="withdraw-left" x1="9" y1="23" x2="24" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#527398" />
          <stop offset="1" stopColor="#283D56" />
        </linearGradient>
        <linearGradient id="withdraw-right" x1="24" y1="28" x2="39" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D91B8" />
          <stop offset="1" stopColor="#344D69" />
        </linearGradient>
        <linearGradient id="withdraw-arrow" x1="24" y1="4" x2="24" y2="25" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2F1FF" />
          <stop offset="1" stopColor="#86ACD4" />
        </linearGradient>
        <filter id="withdraw-shadow" x="3" y="12" width="42" height="36" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <ellipse cx="24" cy="41.5" rx="15.5" ry="3" fill="#060B11" opacity=".45" filter="url(#withdraw-shadow)" />
      <path d="M9 22.5 24 15l15 7.5-15 7.7-15-7.7Z" fill="url(#withdraw-top)" />
      <path d="M9 22.5v13.8l15 7.4V30.2l-15-7.7Z" fill="url(#withdraw-left)" />
      <path d="M24 30.2v13.5l15-7.4V22.5l-15 7.7Z" fill="url(#withdraw-right)" />
      <path d="m15 22.6 9 4.6 9-4.6" fill="none" stroke="#D9ECFF" strokeLinecap="round" strokeLinejoin="round" strokeOpacity=".48" strokeWidth="1.2" />
      <path d="M24 25V9m-5 4.5 5-5 5 5" fill="none" stroke="url(#withdraw-arrow)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8" />
      <path d="M12 24.2v10.2m2.6-8.8v10.1" stroke="#BFD9F4" strokeLinecap="round" strokeOpacity=".18" strokeWidth=".8" />
    </svg>
  );
}

export function Trade3DIcon({ className }: QuickActionIconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="trade-blue-coin" x1="8" y1="21" x2="23" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A8CBED" />
          <stop offset="1" stopColor="#4A6C91" />
        </linearGradient>
        <linearGradient id="trade-silver-coin" x1="25" y1="13" x2="40" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2EDF8" />
          <stop offset="1" stopColor="#7B91A9" />
        </linearGradient>
        <linearGradient id="trade-arrow" x1="10" y1="9" x2="39" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D8EBFF" />
          <stop offset="1" stopColor="#789DC5" />
        </linearGradient>
        <filter id="trade-shadow" x="4" y="8" width="41" height="39" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <ellipse cx="24" cy="42.5" rx="15" ry="2.4" fill="#060B11" opacity=".4" filter="url(#trade-shadow)" />
      <path d="M12.1 16.5a14.8 14.8 0 0 1 23.1-3.8l2.2 2.4" fill="none" stroke="url(#trade-arrow)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
      <path d="m33.1 15.2 4.6.1-.2-4.6" fill="none" stroke="#CDE3FA" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M35.9 31.8a14.8 14.8 0 0 1-23.1 3.8l-2.2-2.4" fill="none" stroke="url(#trade-arrow)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
      <path d="m14.9 33.1-4.6-.1.2 4.6" fill="none" stroke="#AFCBE7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      <path d="M8.5 25v5.2c0 2.1 3.1 3.8 7 3.8s7-1.7 7-3.8V25" fill="#3A5879" />
      <ellipse cx="15.5" cy="25" rx="7" ry="3.8" fill="url(#trade-blue-coin)" />
      <ellipse cx="15.5" cy="25" rx="3.2" ry="1.7" fill="none" stroke="#D9ECFF" strokeOpacity=".64" strokeWidth="1" />
      <path d="M25.5 17v5c0 2.1 3.1 3.8 7 3.8s7-1.7 7-3.8v-5" fill="#596E86" />
      <ellipse cx="32.5" cy="17" rx="7" ry="3.8" fill="url(#trade-silver-coin)" />
      <ellipse cx="32.5" cy="17" rx="3.2" ry="1.7" fill="none" stroke="#F0F6FC" strokeOpacity=".7" strokeWidth="1" />
      <path d="M8.8 26.2c.8 1.7 3.5 2.8 6.7 2.8 2.6 0 4.8-.7 6-1.9m4-9.1c1.2 1.2 3.4 1.9 6 1.9 3.2 0 5.9-1.1 6.7-2.8" fill="none" stroke="#E8F3FF" strokeLinecap="round" strokeOpacity=".36" strokeWidth=".9" />
    </svg>
  );
}

export function Transactions3DIcon({ className }: QuickActionIconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="transactions-page" x1="12" y1="6" x2="34" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9BBBDD" />
          <stop offset="1" stopColor="#3A5878" />
        </linearGradient>
        <linearGradient id="transactions-edge" x1="13" y1="30" x2="31" y2="39" gradientUnits="userSpaceOnUse">
          <stop stopColor="#527195" />
          <stop offset="1" stopColor="#263A52" />
        </linearGradient>
        <linearGradient id="transactions-clock" x1="27" y1="24" x2="40" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2F0FF" />
          <stop offset="1" stopColor="#88A9CB" />
        </linearGradient>
        <filter id="transactions-shadow" x="6" y="5" width="39" height="43" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="1.3" />
        </filter>
      </defs>
      <ellipse cx="25" cy="42" rx="13" ry="2.5" fill="#060B11" opacity=".42" filter="url(#transactions-shadow)" />
      <path d="m12.5 8 18.8 3.8v26l-18.8-3.9V8Z" fill="url(#transactions-edge)" />
      <path d="m10.5 6 18.8 3.8v26l-18.8-3.9V6Z" fill="url(#transactions-page)" />
      <path d="m14.5 12.6 10.8 2.2m-10.8 4 10.8 2.2m-10.8 4 7.2 1.5" fill="none" stroke="#E1F0FF" strokeLinecap="round" strokeOpacity=".72" strokeWidth="1.4" />
      <path d="m10.8 6.8 17.8 3.6v1.5L10.8 8.3V6.8Z" fill="#E3F2FF" opacity=".26" />
      <circle cx="33.5" cy="32.5" r="7.1" fill="#162638" opacity=".55" />
      <circle cx="32.5" cy="31.5" r="6.7" fill="url(#transactions-clock)" />
      <circle cx="32.5" cy="31.5" r="5.2" fill="#3D5B7A" />
      <path d="M32.5 28.3v3.6l2.5 1.5" fill="none" stroke="#EAF4FF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>
  );
}
