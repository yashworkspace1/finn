'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FINN Error Boundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6">
          <div className="flex max-w-md flex-col items-center justify-center gap-4 rounded-xl border bg-card p-8 text-center shadow-sm">
            <div className="rounded-full bg-destructive/10 p-3 text-destructive">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                We encountered an unexpected error while rendering this component.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-4"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
