/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { LoginScreen } from './components/LoginScreen';

function AppContent() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <Layout />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

