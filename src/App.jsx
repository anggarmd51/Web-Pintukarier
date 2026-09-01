import React from 'react';
import { Toaster } from 'react-hot-toast';
import JobBoard from './components/JobBoard';

export default function App() {
  return (
    <>
      <JobBoard />
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 3500 }} />
    </>
  );
}