import { SignupForm } from '@/components/auth/SignupForm'
import { Stethoscope } from 'lucide-react'

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[100px]" />
            </div>

            <div className="w-full max-w-lg relative">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50 dark:border-gray-800/50 transition-colors">
                    <div className="mb-8 flex justify-center">
                        <div className="h-16 w-16 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform rotate-3">
                            <Stethoscope className="h-8 w-8 text-white -rotate-3" />
                        </div>
                    </div>
                    <SignupForm />
                </div>
                <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Clinova. Todos los derechos reservados.
                </p>
            </div>
        </div>
    )
}
