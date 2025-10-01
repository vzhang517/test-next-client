'use client';

import Link from 'next/link'
export default function Authenticated() {

    return(
        // Success state
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Authenticated!</h3>
                <p className="mt-2 text-sm text-gray-500">
                    You have been successfully authenticated.
                </p>
                <Link href="/main">
                <button
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    Ok
                </button>
                </Link>
            </div>
        </div>
        </div>
        </>
    )
}