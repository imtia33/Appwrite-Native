import { cn } from '../../lib/utils';
import { View } from 'react-native';

function Skeleton({ className, ...props }) {
  return <View className={cn('bg-input animate-pulse rounded-md', className)} {...props} />;
}

export { Skeleton };
