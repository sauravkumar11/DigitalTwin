"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * useGLTF/GLTFLoader throws synchronously when the model file is missing or
 * fails to parse - Suspense only handles the "still loading" promise case,
 * not load failures, so a real error boundary is required here.
 */
export class AnatomyErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Anatomy model failed to load:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
