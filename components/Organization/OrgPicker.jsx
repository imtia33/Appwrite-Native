import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export function OrganizationPicker({ organizations, selectedOrganization, setSelectedOrganization }) {
  const ref = React.useRef(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  return (
    <Select value={selectedOrganization?.$id} onValueChange={(value) => {
      console.log('Picker onValueChange raw value:', value);
      const idToFind = typeof value === 'object' ? (value.$id || value.value) : value;
      console.log('Searching for Org ID:', idToFind);
      const org = organizations.find(o => o.$id === idToFind);
      if (org) {
        console.log('Found Org, setting current:', org.name);
        setSelectedOrganization(org);
      } else {
        console.warn('Org not found in list for ID:', idToFind);
      }
    }}>
      <SelectTrigger ref={ref} className="w-auto border border-0 bg-transparent">
        <SelectValue className="font-medium text-foreground dark:text-white" placeholder={selectedOrganization?.name || "Select Organization"} />
      </SelectTrigger>
      <SelectContent insets={contentInsets} className="w-[180px]">
        <SelectGroup>
          <SelectLabel className="text-muted-foreground">Organizations</SelectLabel>
          {organizations.map((org) => (
            <SelectItem key={org.$id} label={org.name} value={org.$id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}