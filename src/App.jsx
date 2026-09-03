import React from 'react';
import { Toaster } from 'react-hot-toast';
import JobBoard from './components/JobBoard';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <JobBoard />
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 3500 }} />
    </ErrorBoundary>
  );
}