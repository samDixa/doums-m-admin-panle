import React, { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
                    <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-red-500/20 rounded-xl p-8 text-center space-y-4 shadow-2xl shadow-red-500/10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Breach Detected</h1>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm">
                            The neural link has encountered a critical error. The interface has been decoupled to prevent data corruption.
                        </p>
                        <div className="bg-slate-50 dark:bg-zinc-950 rounded-lg p-4 text-left border border-slate-200 dark:border-zinc-800">
                            <p className="text-red-600 dark:text-red-400 font-mono text-[10px] break-all">
                                {this.state.error?.message}
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg py-2 transition-colors font-semibold shadow-lg shadow-blue-500/20 dark:shadow-cyan-500/20"
                        >
                            Reboot Interface
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
