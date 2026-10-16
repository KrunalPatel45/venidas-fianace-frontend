
import {
  createContext,
  useContext,
  useState,
} from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    app: 'Venidas Finance',
    login: 'Login',
    logout: 'Logout',
    username: 'Email or Member Code',
    password: 'Password',
    dashboard: 'Dashboard',
    adminDashboard: 'Admin Dashboard',
    memberDashboard: 'My Dashboard',
    members: 'Members',
    accounts: 'Society Accounts',
    activeAccounts: 'Active Accounts',
    externalBorrowers: 'External Borrowers',
    activeLoans: 'Active Loans',
    outstandingPrincipal: 'Outstanding Principal',
    pendingInvestments: 'Pending Investments',
    pendingInterest: 'Pending Loan Interest',
    pendingInvestment: 'Pending Investment',
    cashBalance: 'Cash Balance',
    monthlyReport: 'Monthly Report',
    expectedInvestment: 'Expected Investment',
    expectedInterest: 'Expected Interest',
    cashReceived: 'Cash Received',
    cashPaid: 'Cash Paid',
    netCashFlow: 'Net Cash Flow',
    refresh: 'Refresh',
    loading: 'Loading...',
    noData: 'No data available',
    signIn: 'Sign in to your account',
    cashOnly: 'Cash Payments Only',
  },
  gu: {
    app: 'વેનિદાસ ફાઇનાન્સ',
    login: 'લોગિન',
    logout: 'લોગઆઉટ',
    username: 'ઈમેલ અથવા સભ્ય કોડ',
    password: 'પાસવર્ડ',
    dashboard: 'ડેશબોર્ડ',
    adminDashboard: 'એડમિન ડેશબોર્ડ',
    memberDashboard: 'મારું ડેશબોર્ડ',
    members: 'સભ્યો',
    accounts: 'સોસાયટી ખાતાઓ',
    activeAccounts: 'ચાલુ ખાતાઓ',
    externalBorrowers: 'બહારના લોનધારકો',
    activeLoans: 'ચાલુ લોન',
    outstandingPrincipal: 'બાકી લોનની મૂળ રકમ',
    pendingInvestments: 'બાકી માસિક રોકાણ',
    pendingInterest: 'બાકી લોન વ્યાજ',
    pendingInvestment: 'બાકી રોકાણ',
    cashBalance: 'રોકડ બેલેન્સ',
    monthlyReport: 'માસિક અહેવાલ',
    expectedInvestment: 'અપેક્ષિત રોકાણ',
    expectedInterest: 'અપેક્ષિત વ્યાજ',
    cashReceived: 'મળેલી રોકડ',
    cashPaid: 'ચૂકવેલી રોકડ',
    netCashFlow: 'ચોખ્ખો રોકડ પ્રવાહ',
    refresh: 'ફરી લોડ કરો',
    loading: 'લોડ થઈ રહ્યું છે...',
    noData: 'કોઈ માહિતી ઉપલબ્ધ નથી',
    signIn: 'તમારા ખાતામાં લોગિન કરો',
    cashOnly: 'માત્ર રોકડ ચુકવણી',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem('vf_language') || 'gu'
  );

  function changeLanguage(nextLanguage) {
    if (!['gu', 'en'].includes(nextLanguage)) return;

    localStorage.setItem('vf_language', nextLanguage);
    setLanguage(nextLanguage);
  }

  function t(key) {
    return translations[language]?.[key] || key;
  }

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('LanguageProvider is missing');
  }

  return context;
}
