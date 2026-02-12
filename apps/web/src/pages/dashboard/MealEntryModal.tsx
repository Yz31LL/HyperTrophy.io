import { useForm } from 'react-hook-form'
import { Button } from '@repo/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@repo/ui/Card'
import { Input } from '@repo/ui/Input'
import { X, Loader2 } from 'lucide-react'

export interface MealFormValues {
  name: string
  protein: number
  carbs: number
  fat: number
}

interface MealEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: MealFormValues) => Promise<void>
}

export function MealEntryModal({ isOpen, onClose, onSave }: MealEntryModalProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
    watch,
  } = useForm<MealFormValues>({
    defaultValues: {
      name: '',
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  })

  // Watch macro inputs
  const protein = watch('protein') || 0
  const carbs = watch('carbs') || 0
  const fat = watch('fat') || 0

  // Calculate calories automatically
  const calories = protein * 4 + carbs * 4 + fat * 9

  if (!isOpen) return null

  const handleFormSubmit = async (data: MealFormValues) => {
    await onSave(data)
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Log a Meal</CardTitle>

          <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Content */}
        <CardContent>
          <form id="meal-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Meal name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Meal Name</label>

              <Input
                {...register('name', {
                  required: 'Name is required',
                })}
                placeholder="e.g. Chicken Breast"
              />
            </div>

            {/* Macro inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Protein (g)</label>

                <Input
                  type="number"
                  {...register('protein', {
                    valueAsNumber: true,
                    min: 0,
                  })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Carbs (g)</label>

                <Input
                  type="number"
                  {...register('carbs', {
                    valueAsNumber: true,
                    min: 0,
                  })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fats (g)</label>

                <Input
                  type="number"
                  {...register('fat', {
                    valueAsNumber: true,
                    min: 0,
                  })}
                />
              </div>

              {/* Auto-calculated calories */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Total kcal</label>

                <Input
                  type="number"
                  value={calories}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            </div>
          </form>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button type="submit" form="meal-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Meal
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
