import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileCheck, Loader2, Dumbbell, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@repo/ui/Button'

export function TrainerOnboarding() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing'>('idle')
  const navigate = useNavigate()

  const handleUpload = () => {
    if (!file) return
    setStatus('uploading')
    // Simulate upload and processing
    setTimeout(() => {
      setStatus('processing')
    }, 1500)
  }

  const inputCyber =
    'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-yellow-500/50 transition-all cursor-pointer group'

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-8 p-8 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/20">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-1/3 h-full bg-yellow-500"
            />
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-yellow-500/20 rounded-full animate-pulse" />
              <ShieldCheck className="h-20 w-20 text-yellow-500" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold uppercase tracking-tighter font-chakra">
              Validation in Progress
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Our team is currently verifying your credentials. This process typically takes 24–48
              hours. We'll notify you once your Trainer Profile is active.
            </p>
          </div>

          <div className="pt-4">
            <Button
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
              onClick={() => navigate('/login')}
            >
              RETURN TO LOGIN
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 relative">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="flex items-center gap-3 bg-zinc-900/80 px-4 py-2 rounded-full border border-white/5">
              <Dumbbell className="h-5 w-5 text-yellow-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                Trainer Enrollment
              </span>
            </div>
          </motion.div>
          <h1 className="text-4xl font-black uppercase tracking-tighter font-chakra italic">
            Verify Your <span className="text-yellow-500">Expertise</span>
          </h1>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            Upload your professional certification (NSCA, NASM, ACE, or equivalent) to qualify as a
            HyperTrophy Pro Coach.
          </p>
        </div>

        {/* Upload Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="space-y-6">
            <label className={inputCyber}>
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
                      <FileCheck className="h-10 w-10 text-yellow-500" />
                    </div>
                    <span className="text-sm font-bold text-white">{file.name}</span>
                    <span className="text-[10px] text-zinc-500 uppercase mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-zinc-800 p-4 rounded-full mb-4 group-hover:bg-zinc-700 transition-colors">
                      <Upload className="h-10 w-10 text-zinc-400 group-hover:text-white" />
                    </div>
                    <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">
                      Click or drag certificate here
                    </span>
                    <span className="text-[10px] text-zinc-600 uppercase mt-2">
                      PDF, JPG or PNG (MAX 10MB)
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black h-14 rounded-xl text-lg uppercase tracking-tighter"
              disabled={!file || status === 'uploading'}
              onClick={handleUpload}
            >
              {status === 'uploading' ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  Submit Application <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>

            <p className="text-[10px] text-center text-zinc-600 uppercase tracking-widest font-mono">
              Secure Cloud Verification Enabled
            </p>
          </div>
        </motion.div>

        {/* Info Footnote */}
        <div className="flex justify-between items-center text-[10px] text-zinc-700 font-mono uppercase tracking-[0.2em] px-2 font-bold">
          <span>HyperTrophy Pro v2.4.0</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Encryption Active
          </span>
        </div>
      </div>
    </div>
  )
}
