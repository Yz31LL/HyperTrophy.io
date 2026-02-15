import { useForm } from 'react-hook-form'
import { Button } from '@repo/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/Card'
import { Input } from '@repo/ui/Input'
import { X, Loader2, Scale } from 'lucide-react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../../lib/firebase'

interface WeightFormValues {
  weight: number
}

interface WeightEntryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WeightEntryModal({ isOpen, onClose }: WeightEntryModalProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<WeightFormValues>()

  if (!isOpen) return null

  const onSubmit = async (data: WeightFormValues) => {
    const user = auth.currentUser
    if (!user) return

    try {
      // SAVE TO FIREBASE
      await addDoc(collection(db, 'users', user.uid, 'weight_logs'), {
        weight: Number(data.weight),
        date: serverTimestamp(), // Uses server time for accuracy
      })
      reset()
      onClose()
    } catch (error) {
      console.error('Error logging weight:', error)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="weight-modal-title"
    >
      <Card className="w-full max-w-sm bg-zinc-950 border-zinc-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle id="weight-modal-title" className="text-white flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-500" aria-hidden="true" /> Log Weight
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-400"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardHeader>
        <CardContent>
          <form id="weight-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Current Weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                className="bg-zinc-900 border-zinc-800 text-white text-lg"
                placeholder="e.g. 75.5"
                {...register('weight', { required: true, valueAsNumber: true })}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="weight-form"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-500"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Log
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
