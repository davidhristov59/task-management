import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Repeat } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { RecurrenceType } from '../../types';
import type { CreateRecurringTaskRequest } from '../../types';

const recurringTaskSchema = z.object({
  type: z.enum([RecurrenceType.DAILY, RecurrenceType.WEEKLY, RecurrenceType.MONTHLY]),
  interval: z.number().min(1, 'Interval must be at least 1').max(365, 'Interval cannot exceed 365'),
  endDate: z.string().optional(),
});

type RecurringTaskFormData = z.infer<typeof recurringTaskSchema>;

interface RecurringTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRecurringTaskRequest) => void;
  isLoading?: boolean;
}

function RecurringTaskForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: RecurringTaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecurringTaskFormData>({
    resolver: zodResolver(recurringTaskSchema),
    defaultValues: {
      type: RecurrenceType.DAILY,
      interval: 1,
      endDate: '',
    },
  });

  
  useEffect(() => {
    if (isOpen) {
      reset({
        type: RecurrenceType.DAILY,
        interval: 1,
        endDate: '',
      });
    }
  }, [isOpen, reset]);

  const type = watch('type');
  const interval = watch('interval');

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data: RecurringTaskFormData) => {
    const endDateValue = data.endDate ? new Date(data.endDate + 'T23:59:59.999Z').toISOString() : undefined;

    const recurringData: CreateRecurringTaskRequest = {
      type: data.type,
      interval: data.interval,
      endDate: endDateValue,
    };

    onSubmit(recurringData);
  };

  const getIntervalLabel = (type: RecurrenceType, interval: number) => {
    const baseLabels = {
      [RecurrenceType.DAILY]: interval === 1 ? 'day' : 'days',
      [RecurrenceType.WEEKLY]: interval === 1 ? 'week' : 'weeks',
      [RecurrenceType.MONTHLY]: interval === 1 ? 'month' : 'months',
    };
    return baseLabels[type];
  };

  const getRecurrenceDescription = () => {
    if (!type || !interval) return '';
    
    const intervalLabel = getIntervalLabel(type, interval);
    return `Repeats every ${interval} ${intervalLabel}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Set Up Recurring Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Recurrence Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Recurrence Type *</Label>
            <Select
              value={type}
              onValueChange={(value) => setValue('type', value as RecurrenceType)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select recurrence type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value={RecurrenceType.DAILY}>Daily</SelectItem>
                <SelectItem value={RecurrenceType.WEEKLY}>Weekly</SelectItem>
                <SelectItem value={RecurrenceType.MONTHLY}>Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interval */}
          <div className="space-y-2">
            <Label htmlFor="interval">
              Repeat Every * 
              <span className="text-sm text-gray-500 ml-1">
                ({getIntervalLabel(type, interval || 1)})
              </span>
            </Label>
            <Input
              id="interval"
              type="number"
              min="1"
              max="365"
              {...register('interval', { valueAsNumber: true })}
              placeholder="1"
              className={errors.interval ? 'border-red-500' : ''}
            />
            {errors.interval && (
              <p className="text-sm text-red-600">{errors.interval.message}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              {...register('endDate')}
              className={errors.endDate ? 'border-red-500' : ''}
            />
            {errors.endDate && (
              <p className="text-sm text-red-600">{errors.endDate.message}</p>
            )}
            <p className="text-sm text-gray-500">
              Leave empty for no end date
            </p>
          </div>

          {/* Preview */}
          {type && interval && (
            <div className="p-3 bg-white border border-black rounded-md">
              <p className="text-sm font-medium text-black">
                Preview: {getRecurrenceDescription()}
              </p>
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button className='bg-black text-white' type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Set Recurrence'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RecurringTaskForm;