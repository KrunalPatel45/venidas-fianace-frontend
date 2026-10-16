
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import MemberDashboard from './pages/MemberDashboard';
import SocietyDashboardPage from './pages/SocietyDashboardPage';
import MembersPage from './pages/MembersPage';
import AccountsPage from './pages/AccountsPage';
import MonthlyInvestmentsPage from './pages/MonthlyInvestmentsPage';

import LoansPage from './pages/LoansPage';
import LoanDetailsPage from './pages/LoanDetailsPage';
import ExternalBorrowersPage from './pages/ExternalBorrowersPage';

import FinancialReportsPage from './pages/FinancialReportsPage';
import MonthlyMemberStatementPage from './pages/MonthlyMemberStatementPage';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route
                  path="/my/dashboard"
                  element={<MemberDashboard />}
                />

                <Route
                  path="/society/dashboard"
                  element={<SocietyDashboardPage />}
                />

                <Route element={<ProtectedRoute adminOnly />}>
                  <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                  />

                  <Route
                    path="/admin/members"
                    element={<MembersPage />}
                  />

                  <Route
                    path="/admin/accounts"
                    element={<AccountsPage />}
                  />

                  <Route
                    path="/admin/monthly-investments"
                    element={<MonthlyInvestmentsPage />}
                  />

                  <Route
                    path="/admin/loans"
                    element={<LoansPage />}
                  />

                  <Route
                    path="/admin/loans/:loanId"
                    element={<LoanDetailsPage />}
                  />

                  <Route
                    path="/admin/external-borrowers"
                    element={<ExternalBorrowersPage />}
                  />

                  <Route
                    path="/admin/reports/financial"
                    element={<FinancialReportsPage />}
                  />

                  <Route
                    path="/admin/reports/monthly-member-statement"
                    element={<MonthlyMemberStatementPage />}
                  />
                </Route>
              </Route>
            </Route>

            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
