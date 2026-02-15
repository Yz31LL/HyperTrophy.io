import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@repo/ui/Card'
import { Button } from '@repo/ui/Button'

interface PlateauAlertProps {
  isDetected: boolean
}

export function PlateauAlert({ isDetected }: PlateauAlertProps) {
  return (
    <AnimatePresence>
      {isDetected && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-orange-900 dark:text-orange-100">Plateau Detected</h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Your weight has remained stable for 14 days. To break through, try increasing your
                  calorie intake by 200kcal or adding a "Drop Set" to your next workout.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 bg-white"
                  >
                    Adjust Calories
                  </Button>
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                    <TrendingUp className="w-3 h-3 mr-2" /> View Breakthrough Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
